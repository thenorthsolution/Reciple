import { ApplicationCommandType, Awaitable, Collection, RestOrArray, normalizeArray } from 'discord.js';
import { RecipleClient } from '../RecipleClient';
import { RecipleModule, RecipleModuleScript } from '../RecipleModule';
import { path } from 'fallout-utility';
import semver from 'semver';
import { TypedEmitter } from 'tiny-typed-emitter';
import { inspect } from 'util';
import { ModuleError } from '../errors/ModuleError';
import { realVersion, recursiveDefaults } from '../..';

export interface ModuleManagerEvents {
    resolveModuleFileError: (file: string, error: Error) => Awaitable<void>;

    startModuleFailed: (module: RecipleModule) => Awaitable<void>;
    preStartModule: (module: RecipleModule) => Awaitable<void>;
    postStartModule: (module: RecipleModule) => Awaitable<void>;
    startModuleError: (module: RecipleModule, error: Error) => Awaitable<void>;

    preLoadModule: (module: RecipleModule) => Awaitable<void>;
    postLoadModule: (module: RecipleModule) => Awaitable<void>;
    loadModuleError: (module: RecipleModule, error: Error) => Awaitable<void>;

    preUnloadModule: (module: RecipleModule) => Awaitable<void>;
    postUnloadModule: (module: RecipleModule) => Awaitable<void>;
    unloadModuleError: (module: RecipleModule, error: Error) => Awaitable<void>;
}

export interface ModuleManagerOptions {
    client: RecipleClient;
    modules?: (RecipleModule|RecipleModuleScript)[];
}

export interface ModuleManagerModulesActionOptions {
    modules: RecipleModule[];
}

export class ModuleManager extends TypedEmitter<ModuleManagerEvents> {
    readonly client: RecipleClient;
    readonly modules: Collection<string, RecipleModule> = new Collection();

    constructor(options: ModuleManagerOptions) {
        super();

        this.client = options.client;
        options.modules?.forEach(m => m instanceof RecipleModule ? this.modules.set(m.id, m) : new RecipleModule({ client: this.client, script: m }))
    }

    public async startModules(options: ModuleManagerModulesActionOptions & { addToModulesCollection?: boolean; }): Promise<RecipleModule[]> {
        const startModules: RecipleModule[] = [];

        for (const module_ of options.modules) {
            this.emit('preStartModule', module_);

            try {
                let error: Error|null = null;

                const start = await module_.start().catch(err => {
                    error = err;
                    return false;
                });

                if (error) throw new ModuleError('LoadModuleFail', module_.displayName, inspect(error));
                if (!start) {
                    this.emit('startModuleFailed', module_);
                    continue;
                }

                if (options.addToModulesCollection !== false) this.modules.set(module_.id, module_);

                startModules.push(module_);
                this.emit('postStartModule', module_);
            } catch(err) {
                this._throwError(err as Error, { name: 'startModuleError', values: [module_, err as Error] });
            }
        }

        return startModules;
    }

    public async loadModules(options: ModuleManagerModulesActionOptions & { resolveCommands?: boolean; }): Promise<RecipleModule[]> {
        const loadedModules: RecipleModule[] = [];

        for (const module_ of options.modules) {
            this.emit('preLoadModule', module_);

            try {
                await module_.load(options.resolveCommands !== false);
                if (module_.commands.length) this.client.commands.add(...module_.commands);

                this.emit('postLoadModule', module_);
                loadedModules.push(module_);
            } catch(err) {
                this._throwError(err as Error, { name: 'loadModuleError', values: [module_, err as Error] });
            }
        }

        return loadedModules;
    }

    public async unloadModules(options: ModuleManagerModulesActionOptions & { reason?: string; removeFromModulesCollection?: boolean; removeCommandsFromClient?: boolean; }): Promise<RecipleModule[]> {
        const unloadedModules: RecipleModule[] = [];

        for (const module_ of options.modules) {
            this.emit('preUnloadModule', module_);

            try {
                await module_.unload(options.reason);

                if (options.removeCommandsFromClient !== false) {
                    for (const cmd of module_.commands) {
                        if (cmd.isContextMenu()) {
                            this.client.commands.contextMenuCommands.delete(cmd.name);

                            const applicationCommands = this.client.application?.commands.cache.filter(c => c.name === cmd.name && (c.type === ApplicationCommandType.Message || c.type === ApplicationCommandType.User)).toJSON();
                            for (const applicationCommand of (applicationCommands ?? [])) {
                                await this.client.application?.commands.delete(applicationCommand, applicationCommand.guildId || undefined);
                            }
                        } else if (cmd.isMessageCommand()) {
                            this.client.commands.messageCommands.delete(cmd.name);
                        } else if (cmd.isSlashCommand()) {
                            this.client.commands.slashCommands.delete(cmd.name);

                            const applicationCommands = this.client.application?.commands.cache.filter(c => c.name === cmd.name && c.type === ApplicationCommandType.ChatInput).toJSON();
                            for (const applicationCommand of (applicationCommands ?? [])) {
                                await this.client.application?.commands.delete(applicationCommand, applicationCommand.guildId || undefined);
                            }
                        }
                    }
                }

                if (options.removeFromModulesCollection !== false) this.modules.delete(module_.id);

                this.emit('postUnloadModule', module_);
                unloadedModules.push(module_);
            } catch(err) {
                this._throwError(err as Error, { name: 'unloadModuleError', values: [module_, err as Error] });
            }
        }

        return unloadedModules;
    }

    public async resolveModuleFiles(files: string[], disableVersionCheck: boolean = false): Promise<RecipleModule[]> {
        const modules: RecipleModule[] = [];

        for (const file of files) {
            const filePath = path.resolve(file);

            try {
                const resolveFile = await import(filePath);

                const script = recursiveDefaults<RecipleModuleScript|RecipleModule>(resolveFile);

                if (script instanceof RecipleModule) {
                    modules.push(script);
                    continue;
                }

                this.validateScript(script);

                if (!disableVersionCheck && !normalizeArray([script.versions] as RestOrArray<string>)?.some(v => semver.satisfies(this.client.version, v))) {
                    throw new ModuleError('UnsupportedModule', filePath, realVersion);
                }

                modules.push(
                    new RecipleModule({
                        client: this.client,
                        script,
                        filePath,
                    })
                );
            } catch(err) {
                this._throwError(err as Error, { name: 'resolveModuleFileError', values: [filePath, err as Error] });
            }
        }

        return modules;
    }

    public isRecipleModuleScript(script: unknown): script is RecipleModuleScript {
        try {
            this.validateScript(script);
            return true;
        } catch(err) {
            return false;
        }
    }

    public validateScript(script: unknown): asserts script is RecipleModuleScript {
        const s = script as Partial<RecipleModuleScript>;

        if (typeof s !== 'object') return this.client._throwError(new ModuleError('InvalidScript'));
        if (typeof s.versions !== 'string' && !Array.isArray(s.versions)) return this.client._throwError(new ModuleError(`NoSupportedVersions`));
        if (typeof s.onStart !== 'function') return this.client._throwError(new ModuleError('InvalidOnStartEvent'));
        if (s.onLoad && typeof s.onLoad !== 'function') return this.client._throwError(new ModuleError('InvalidOnLoadEvent'));
        if (s.onUnload && typeof s.onUnload !== 'function') return this.client._throwError(new ModuleError('InvalidOnUnloadEvent'));
    }

    public _throwError<E extends keyof ModuleManagerEvents>(error: Error, event: { name: E; values: Parameters<ModuleManagerEvents[E]>; }, throwWhenNoListener: boolean = true): void {
        if (!this.listenerCount(event.name)) {
            if (!throwWhenNoListener) return;
            throw error;
        }

        this.emit(event.name, ...event.values);
    }
}
