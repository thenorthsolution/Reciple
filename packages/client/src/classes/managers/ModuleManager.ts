import { createLoadModuleFailErrorOptions, createUnsupportedModuleErrorOptions } from '../../utils/errorCodes';
import { ApplicationCommandType, Awaitable, Collection, RestOrArray, normalizeArray } from 'discord.js';
import { RecipleModuleAssertions } from '../assertions/RecipleModuleAssertions';
import { RecursiveDefault, recursiveDefaults } from '../../utils/functions';
import { AnyCommandBuilder, AnyCommandData } from '../../types/commands';
import { RecipleModule, RecipleModuleScript } from '../RecipleModule';
import { RecipleError } from '../errors/RecipleError';
import { ModuleError } from '../errors/ModuleError';
import { RecipleClient } from '../RecipleClient';
import { TypedEmitter } from 'fallout-utility';
import { deprecate } from 'node:util';
import path from 'node:path';
import semver from 'semver';

export interface ModuleManagerEvents {
    resolveModuleFileError: [file: string, error: Error];

    startModuleFailed: [module: RecipleModule];
    preStartModule: [module: RecipleModule];
    postStartModule: [module: RecipleModule];
    startModuleError: [module: RecipleModule, error: Error];
    startedModules: [modules: RecipleModule[]];

    preLoadModule: [module: RecipleModule];
    postLoadModule: [module: RecipleModule];
    loadModuleError: [module: RecipleModule, error: Error];
    loadedModules: [modules: RecipleModule[]];

    preUnloadModule: [module: RecipleModule];
    postUnloadModule: [module: RecipleModule];
    unloadModuleError: [module: RecipleModule, error: Error];
    unloadedModules: [modules: RecipleModule[]];
}

export interface ModuleManagerOptions {
    client: RecipleClient;
    modules?: (RecipleModule|RecipleModuleScript)[];
}

export interface ModuleManagerModulesActionOptions<S extends RecipleModuleScript = RecipleModuleScript> {
    modules: RecipleModule<S>[];
}

export class ModuleManager extends TypedEmitter<ModuleManagerEvents> {
    readonly client: RecipleClient;
    readonly cache: Collection<string, RecipleModule> = new Collection();

    constructor(options: ModuleManagerOptions) {
        super();

        this.client = options.client;
        options.modules?.forEach(m => m instanceof RecipleModule ? this.cache.set(m.id, m) : new RecipleModule({ client: this.client, script: m }));

        this.validateScript = deprecate(this.validateScript, '<ModuleManager>.validateScript() is deprecated. Use RecipleModuleAssertions.validateModuleScript() method instead.');
    }

    /**
     * This method takes a command object and returns the module that contains the command. If the command is not found, the function returns undefined.
     */
    public findCommandModule<S extends RecipleModuleScript = RecipleModuleScript>(command: AnyCommandData|AnyCommandBuilder): RecipleModule<S>|undefined {
        return (this.cache as Collection<string, RecipleModule<S>>).find(m => m.commands.some(c => c.commandType === command.commandType && c.name === command.name));
    }

    /**
     * This method starts the specified modules. The modules will be started in the order that they are specified.
     * @returns The started modules
     */
    public async startModules<S extends RecipleModuleScript = RecipleModuleScript>(options: ModuleManagerModulesActionOptions<S> & { addToModulesCollection?: boolean; }): Promise<RecipleModule<S>[]> {
        const startModules: RecipleModule<S>[] = [];

        for (const module_ of options.modules) {
            this.emit('preStartModule', module_);

            try {
                let error: Error|null = null;

                const start = await module_.start().catch(err => {
                    error = err;
                    return false;
                });

                if (error) throw new RecipleError(createLoadModuleFailErrorOptions(module_.displayName, error));
                if (!start) {
                    this.emit('startModuleFailed', module_);
                    continue;
                }

                if (options.addToModulesCollection !== false) this.cache.set(module_.id, module_);

                startModules.push(module_);
                this.emit('postStartModule', module_);
            } catch(err) {
                this._throwError(err as Error, { name: 'startModuleError', values: [module_, err as Error] });
            }
        }

        this.emit('startedModules', startModules);
        return startModules;
    }

    /**
     * This method loads the specified modules. The modules will be loaded in the order that they are specified.
     * @returns The loaded modules
     */
    public async loadModules<S extends RecipleModuleScript = RecipleModuleScript>(options: ModuleManagerModulesActionOptions<S> & { resolveCommands?: boolean; }): Promise<RecipleModule<S>[]> {
        const loadedModules: RecipleModule<S>[] = [];

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

        this.emit('loadedModules', loadedModules);
        return loadedModules;
    }

    /**
     * This method unloads the specified modules. The modules will be unloaded in the reverse order that they were loaded.
     * @returns The unloaded modules
     */
    public async unloadModules<S extends RecipleModuleScript = RecipleModuleScript>(options: ModuleManagerModulesActionOptions<S> & { reason?: string; removeFromModulesCollection?: boolean; removeCommandsFromClient?: boolean; }): Promise<RecipleModule<S>[]> {
        const unloadedModules: RecipleModule<S>[] = [];

        for (const module_ of options.modules) {
            this.emit('preUnloadModule', module_);

            try {
                await module_.unload(options.reason);

                if (options.removeCommandsFromClient !== false) {
                    for (const cmd of module_.commands) {
                        if (cmd.isContextMenu()) {
                            this.client.commands.contextMenuCommands.delete(cmd.name);

                            const applicationCommands = this.client.application?.commands.cache.filter(c => c.name === cmd.name && (c.type === ApplicationCommandType.Message || c.type === ApplicationCommandType.User)).values();
                            for (const applicationCommand of (applicationCommands ?? [])) {
                                await this.client.application?.commands.delete(applicationCommand, applicationCommand.guildId || undefined);
                            }
                        } else if (cmd.isMessageCommand()) {
                            this.client.commands.messageCommands.delete(cmd.name);
                        } else if (cmd.isSlashCommand()) {
                            this.client.commands.slashCommands.delete(cmd.name);

                            const applicationCommands = this.client.application?.commands.cache.filter(c => c.name === cmd.name && c.type === ApplicationCommandType.ChatInput).values();
                            for (const applicationCommand of (applicationCommands ?? [])) {
                                await this.client.application?.commands.delete(applicationCommand, applicationCommand.guildId || undefined);
                            }
                        }
                    }
                }

                if (options.removeFromModulesCollection !== false) this.cache.delete(module_.id);

                this.emit('postUnloadModule', module_);
                unloadedModules.push(module_);
            } catch(err) {
                this._throwError(err as Error, { name: 'unloadModuleError', values: [module_, err as Error] });
            }
        }

        this.emit('unloadedModules', unloadedModules);

        return unloadedModules;
    }

    public async resolveModuleFiles<S extends RecipleModuleScript = RecipleModuleScript>(files: string[], disableVersionCheck: boolean = false, fileResolver?: (filePath: string) => Awaitable<undefined|RecursiveDefault<RecipleModule<S>|S>|RecipleModule<S>|S>): Promise<RecipleModule<S>[]> {
        const modules: RecipleModule<S>[] = [];

        for (const file of files) {
            const filePath = path.resolve(file);

            try {
                let resolveFile = fileResolver ? await Promise.resolve(fileResolver(filePath)) : undefined;
                    resolveFile = resolveFile === undefined ? await import(`file://${filePath}`) : resolveFile;

                const script = recursiveDefaults<S|RecipleModule<S>|undefined>(resolveFile);

                if (script instanceof RecipleModule) {
                    if (!disableVersionCheck && !script.isSupported) throw new RecipleError(createUnsupportedModuleErrorOptions(script.displayName));
                    modules.push(script);
                    continue;
                }

                RecipleModuleAssertions.validateModuleScript(script);

                if (!disableVersionCheck && !normalizeArray([script.versions] as RestOrArray<string>)?.some(v => v === "latest" || semver.satisfies(this.client.version, v))) {
                    throw new RecipleError(createUnsupportedModuleErrorOptions(filePath));
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
            RecipleModuleAssertions.validateModuleScript(script);
            return true;
        } catch(err) {
            return false;
        }
    }

    // TODO: Remove deprecated

    /**
     * @deprecated Use the assertion method `RecipleModuleAssertions#validateModuleScript`
     */
    public validateScript<S extends RecipleModuleScript = RecipleModuleScript>(script: unknown): asserts script is S {
        const s = script as Partial<RecipleModuleScript>;

        if (typeof s !== 'object') return this.client._throwError(new ModuleError('InvalidScript'));
        if (typeof s.versions !== 'string' && !Array.isArray(s.versions)) return this.client._throwError(new ModuleError(`NoSupportedVersions`));
        if (typeof s.onStart !== 'function') return this.client._throwError(new ModuleError('InvalidOnStartEvent'));
        if (s.onLoad && typeof s.onLoad !== 'function') return this.client._throwError(new ModuleError('InvalidOnLoadEvent'));
        if (s.onUnload && typeof s.onUnload !== 'function') return this.client._throwError(new ModuleError('InvalidOnUnloadEvent'));
    }

    /**
     * @deprecated Use the ModuleManager.cache property instead
     */
    get modules() { return this.cache; }

    public _throwError<E extends keyof ModuleManagerEvents>(error: Error, event: { name: E; values: ModuleManagerEvents[E]; }, throwWhenNoListener: boolean = true): void {
        if (!this.listenerCount(event.name)) {
            if (!throwWhenNoListener) return;
            throw error;
        }

        this.emit(event.name, ...event.values);
    }
}
