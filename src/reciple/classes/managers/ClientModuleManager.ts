import { Collection, normalizeArray, RestOrArray } from 'discord.js';
import { existsSync, lstatSync, mkdirSync, readdirSync } from 'fs';
import path from 'path';
import { inspect } from 'util';
import wildcardMatch from 'wildcard-match';
import { cwd } from '../../flags';
import { ClientModuleManagerGetModulePathsOptions, ClientModuleManagerLoadModulesOptions, ClientModuleManagerResolveModuleFilesOptions, ClientModuleManagerStartModulesOptions, ClientModuleManagerUnloadModulesOptions } from '../../types/paramOptions';
import { RecipleClient } from '../RecipleClient';
import { RecipleModule, RecipleScript } from '../RecipleModule';

export interface ClientModuleManagerOptions {
    client: RecipleClient;
    modules?: (RecipleModule | RecipleScript)[];
}

export class ClientModuleManager {
    readonly client: RecipleClient;
    readonly modules: Collection<string, RecipleModule> = new Collection();

    constructor(options: ClientModuleManagerOptions) {
        this.client = options.client;

        options.modules?.forEach(m => (m instanceof RecipleModule ? m : new RecipleModule({ client: this.client, script: m })));
    }

    /**
     * Start modules
     * @param options start modules options
     * @returns started modules
     */
    public async startModules(options: ClientModuleManagerStartModulesOptions): Promise<RecipleModule[]> {
        const startedModules: RecipleModule[] = [];

        for (const module_ of options.modules) {
            if (!this.client.isClientLogsSilent) this.client.logger.log(`Starting module '${module_}'`);

            try {
                let error: unknown;

                const start = await module_.start().catch(err => {
                    error = err;
                    return false;
                });

                if (error) throw new Error(`An error occured while loading module '${module_}': \n${inspect(error)}`);
                if (!start) {
                    if (!this.client.isClientLogsSilent) this.client.logger.error(`Module '${module_}' returned false onStart`);
                    continue;
                }

                if (options.addToModulesCollection !== false) this.modules.set(module_.id, module_);

                startedModules.push(module_);
            } catch (err) {
                if (options?.ignoreErrors === false) throw err;
                if (!this.client.isClientLogsSilent) this.client.logger.error(`Failed to start module '${module_}': `, err);
            }
        }

        return startedModules;
    }

    /**
     * Load modules
     * @param options load modules options
     * @returns loaded modules
     */
    public async loadModules(options?: ClientModuleManagerLoadModulesOptions): Promise<RecipleModule[]> {
        const loadedModules: RecipleModule[] = [];

        for (const module_ of options?.modules ?? this.modules.toJSON()) {
            try {
                await module_.load().catch(err => {
                    throw err;
                });

                if (options?.resolveCommands !== false) {
                    module_.resolveCommands();
                    this.client.commands.add(module_.commands);
                }

                loadedModules.push(module_);

                if (!this.client.isClientLogsSilent) this.client.logger.log(`Loaded module '${module_}'`);
            } catch (err) {
                if (options?.ignoreErrors === false) throw err;
                if (!this.client.isClientLogsSilent) this.client.logger.error(`Failed to load module '${module_}': `, err);
            }
        }

        return loadedModules;
    }

    /**
     * Unload modules
     * @param options unload modules options
     * @returns unloaded modules
     */
    public async unloadModules(options?: ClientModuleManagerUnloadModulesOptions): Promise<RecipleModule[]> {
        const unloadedModules: RecipleModule[] = [];

        for (const module_ of options?.modules ?? this.modules.toJSON()) {
            try {
                await module_.unload().catch(err => {
                    throw err;
                });

                unloadedModules.push(module_);

                if (!this.client.isClientLogsSilent) this.client.logger.log(`Unloaded module '${module_}'`);
            } catch (err) {
                if (options?.ignoreErrors === false) throw err;
                if (!this.client.isClientLogsSilent) this.client.logger.error(`Failed to unLoad module '${module_}': `, err);
            }
        }

        return unloadedModules;
    }

    /**
     * Resolve modules from file paths
     * @param options resolve module files options
     * @returns resolved modules
     */
    public async resolveModuleFiles(options: ClientModuleManagerResolveModuleFilesOptions): Promise<RecipleModule[]> {
        const modules: RecipleModule[] = [];

        for (const file of options.files) {
            try {
                const resolveFile = await import(file);

                let script: RecipleScript | RecipleModule | undefined =
                    resolveFile instanceof RecipleModule || ClientModuleManager.validateScript(resolveFile)
                        ? resolveFile
                        : resolveFile?.default?.default instanceof RecipleModule || ClientModuleManager.validateScript(resolveFile?.default?.default)
                        ? resolveFile.default.default
                        : resolveFile?.default;

                if (script instanceof RecipleModule) {
                    modules.push(script);
                    continue;
                }

                if (!ClientModuleManager.validateScript(script)) throw new Error(`Invalid module script: ${file}`);

                modules.push(
                    new RecipleModule({
                        client: this.client,
                        script,
                        filePath: file,
                    })
                );
            } catch (err) {
                if (options.ignoreErrors === false) throw err;
                if (!this.client.isClientLogsSilent) this.client.logger.error(`Can't resolve module from: ${file}`, err);
            }
        }

        return modules;
    }

    /**
     * Validate module script
     * @param script module script
     * @returns `true` if script is valid
     */
    public static validateScript(script: unknown): script is RecipleScript {
        const s = script as Partial<RecipleScript>;

        if (typeof s !== 'object') return false;
        if (typeof s.versions !== 'string' && !Array.isArray(s.versions)) return false;
        if (typeof s.onStart !== 'function') return false;
        if (s.onLoad && typeof s.onLoad !== 'function') return false;
        if (s.onUnload && typeof s.onUnload !== 'function') return false;

        return true;
    }

    /**
     * Get module file paths from folders
     * @param options get module paths options
     * @returns module paths
     */
    public async getModulePaths(options?: ClientModuleManagerGetModulePathsOptions): Promise<string[]> {
        const modules: string[] = [];

        for (const dir of options?.folders ?? normalizeArray([this.client.config.modulesFolder] as RestOrArray<string>)) {
            if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
            if (!lstatSync(dir).isDirectory()) continue;

            modules.push(
                ...readdirSync(dir)
                    .map(file => path.join(cwd, dir, file))
                    .filter(file => (options?.filter ? options.filter(file) : file.endsWith('.js')))
            );
        }

        return modules.filter(file => !(options?.ignoredFiles ?? this.client.config.ignoredFiles).some(ignored => wildcardMatch(ignored)(path.basename(file))));
    }
}
