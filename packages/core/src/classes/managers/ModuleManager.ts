import { RecipleModuleDataValidators } from '../validators/RecipleModuleDataValidators';
import { Awaitable, Collection, Constructable, isJSONEncodable } from 'discord.js';
import { RecipleModule, RecipleModuleData } from '../structures/RecipleModule';
import { RecursiveDefault, recursiveDefaults } from '@reciple/utils';
import { TypedEmitter } from 'fallout-utility/TypedEmitter';
import { RecipleClient } from '../structures/RecipleClient';
import { AnyCommandResolvable } from '../../types/structures';
import { RecipleError } from '../structures/RecipleError';
import { CommandType } from '../../types/constants';
import { DataManager } from './DataManager';
import { Mixin } from 'ts-mixer';
import path from 'node:path';

export interface ModuleManagerEvents {
    resolveModuleFileError: [file: string, error: Error];

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

export interface ModuleManagerModulesActionOptions<D extends RecipleModuleData = RecipleModuleData> {
    modules: RecipleModule<D>[];
}

export interface ModuleManagerResolveModuleFiles<D extends RecipleModuleData = RecipleModuleData> {
    files: string[];
    /**
     * @default false
     */
    disableVersionCheck?: boolean;
    resolveFile?: (file: string) => Awaitable<undefined|null|false|RecursiveDefault<RecipleModule<D>|D>|RecipleModule<D>|D>;
    /**
     * @default true
     */
    cacheModules?: boolean;
}

export interface ModuleManager extends DataManager<RecipleModule>, TypedEmitter<ModuleManagerEvents> {}

export class ModuleManager extends Mixin(DataManager<RecipleModule>, TypedEmitter as Constructable<TypedEmitter<ModuleManagerEvents>>) {
    constructor(client: RecipleClient) {
        super(client);
    }

    public findCommandModule<D extends RecipleModuleData = RecipleModuleData>(command: AnyCommandResolvable): RecipleModule<D>|undefined {
        const data = isJSONEncodable(command) ? command.toJSON() : command;
        return (this.cache as Collection<string, RecipleModule<D>>).find(m => m.commands.some(c => c.command_type === data.command_type && c.name === data.name));
    }

    public async startModules<D extends RecipleModuleData = RecipleModuleData>(options?: Partial<ModuleManagerModulesActionOptions<D>> & { cacheModules?: boolean; removeOnError?: boolean; }): Promise<RecipleModule<D>[]> {
        const startedModules: RecipleModule<D>[] = [];

        for (const m of options?.modules ?? this.cache.values() as IterableIterator<RecipleModule<D>>) {
            this.emit('preStartModule', m);

            try {
                await m.start();

                this.emit('postStartModule', m);
                startedModules.push(m);
            } catch(error) {
                if (options?.removeOnError !== false) this._cache.delete(m.id);
                this._throwError(error as Error, { name: 'startModuleError', values: [m, error as Error] });
            }
        }

        if (options?.cacheModules !== false) startedModules.forEach(m => this._cache.set(m.id, m));

        this.emit('startedModules', startedModules);
        return startedModules;
    }

    public async loadModules<D extends RecipleModuleData = RecipleModuleData>(options?: Partial<ModuleManagerModulesActionOptions<D>> & { cacheCommands?: boolean; removeOnError?: boolean; }): Promise<RecipleModule<D>[]> {
        const loadedModules: RecipleModule<D>[] = [];

        for (const m of options?.modules ?? this.cache.values() as IterableIterator<RecipleModule<D>>) {
            this.emit('preLoadModule', m);

            try {
                await m.load();

                const commands = m.commands;
                if (commands.length) this.client.commands?.add(commands);

                this.emit('postLoadModule', m);
                loadedModules.push(m);
            } catch(error) {
                if (options?.removeOnError !== false) this._cache.delete(m.id);
                this._throwError(error as Error, { name: 'loadModuleError', values: [m, error as Error] });
            }
        }

        this.emit('loadedModules', loadedModules);
        return loadedModules;
    }

    public async unloadModules<D extends RecipleModuleData = RecipleModuleData>(options?: Partial<ModuleManagerModulesActionOptions<D>> & { reason?: string; removeFromCache?: boolean; removeModuleCommands?: boolean; }): Promise<RecipleModule<D>[]> {
        const unloadedModules: RecipleModule<D>[] = [];

        for (const m of options?.modules ?? this.cache.values() as IterableIterator<RecipleModule<D>>) {
            this.emit('preUnloadModule', m);

            try {
                await m.unload();

                if (options?.removeModuleCommands !== false) {
                    const commands = m.commands;

                    removeCommands: for (const command of commands) {
                        switch (command.command_type) {
                            case CommandType.ContextMenuCommand:
                                this.client.commands?.contextMenuCommands.delete(command.name);
                                break removeCommands;
                            case CommandType.MessageCommand:
                                this.client.commands?.messageCommands.delete(command.name);
                                break removeCommands;
                            case CommandType.SlashCommand:
                                this.client.commands?.slashCommands.delete(command.name);
                                break removeCommands;
                        }
                    }
                }

                this.emit('postUnloadModule', m);
                unloadedModules.push(m);
                if (options?.removeFromCache !== false) this._cache.delete(m.id);
            } catch(error) {
                if (options?.removeFromCache !== false) this._cache.delete(m.id);
                this._throwError(error as Error, { name: 'unloadModuleError', values: [m, error as Error] });
            }
        }

        this.emit('unloadedModules', unloadedModules);
        return unloadedModules;
    }

    public async resolveModuleFiles<D extends RecipleModuleData = RecipleModuleData>(options: ModuleManagerResolveModuleFiles<D>): Promise<RecipleModule<D>[]> {
        const modules: RecipleModule<D>[] = [];

        for (const file of options.files) {
            const filePath = path.resolve(file);

            try {
                let resolvedModule = options.resolveFile ? await Promise.resolve(options.resolveFile(filePath)) : undefined;
                    resolvedModule ??= await import(`file://${filePath}`);

                const script = recursiveDefaults<false|undefined|null|D|RecipleModule<D>>(resolvedModule);
                if (!script) throw new RecipleError(RecipleError.createResolveModuleFilesErrorOptions(filePath, `Invalid module data '${String(script)}'`));

                if (script instanceof RecipleModule) {
                    if (!options.disableVersionCheck && !script.supported) throw new RecipleError(RecipleError.createUnsupportedModuleErrorOptions(script.displayName));
                    modules.push(script);
                    continue;
                }

                RecipleModuleDataValidators.isValidRecipleModuleData(script);

                const m = new RecipleModule({
                    client: this.client,
                    file: filePath,
                    data: script
                });

                if (!options.disableVersionCheck && !m.supported) throw new RecipleError(RecipleError.createUnsupportedModuleErrorOptions(filePath));

                modules.push(m);
            } catch(error) {
                this._throwError(error as Error, { name: 'resolveModuleFileError', values: [filePath, error as Error] });
            }
        }

        if (options.cacheModules !== false) modules.forEach(m => this._cache.set(m.id, m));

        return modules;
    }

    public _throwError<E extends keyof ModuleManagerEvents>(error: Error, event: { name: E; values: ModuleManagerEvents[E]; }, throwWhenNoListener: boolean = true): void {
        if (!this.listenerCount(event.name)) {
            if (!throwWhenNoListener) return;
            throw error;
        }

        this.emit(event.name, ...event.values);
    }
}
