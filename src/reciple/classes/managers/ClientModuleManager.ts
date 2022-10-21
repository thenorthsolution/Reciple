import { Collection, normalizeArray, RestOrArray } from 'discord.js';
import { existsSync, lstatSync, mkdirSync, readdirSync } from 'fs';
import path from 'path';
import { inspect } from 'util';
import wildcardMatch from 'wildcard-match';
import { cwd } from '../../flags';
import { ClientModuleManagerGetModulePathsOptions, ClientModuleManagerGetModulesFromFilesOptions } from '../../types/paramOptions';
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

    public async startModules(modules: RecipleModule[], ignoreErrors: boolean = true): Promise<RecipleModule[]> {
        for (const module_ of modules) {
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

                this.modules.set(module_.id, module_);
            } catch (err) {
                if (!ignoreErrors) throw err;
                if (!this.client.isClientLogsSilent) this.client.logger.error(`Failed to start module '${module_}': `, err);
            }
        }

        return modules;
    }

    public async loadModules(modules: RecipleModule[], addModuleCommandsToClient: boolean = true, ignoreErrors: boolean = true): Promise<RecipleModule[]> {
        for (const module_ of this.modules.toJSON()) {
            try {
                await module_.load().catch(err => {
                    throw err;
                });

                if (!this.client.isClientLogsSilent) this.client.logger.log(`Loaded module '${module_}'`);
                if (addModuleCommandsToClient) {
                    this.client.commands.add(module_.commands);
                }
            } catch (err) {
                if (!ignoreErrors) throw err;
                if (!this.client.isClientLogsSilent) this.client.logger.error(`Failed to load module '${module_}': `, err);
            }
        }

        return modules;
    }

    public async unLoadModules(modules: RecipleModule[], removeUnloadedModules: boolean = true, ignoreErrors: boolean = true): Promise<RecipleModule[]> {
        for (const module_ of this.modules.toJSON()) {
            try {
                await module_.unLoad().catch(err => {
                    throw err;
                });

                if (removeUnloadedModules) this.modules.delete(module_.id);
                if (!this.client.isClientLogsSilent) this.client.logger.log(`Unloaded module '${module_}'`);
            } catch (err) {
                if (!ignoreErrors) throw err;
                if (!this.client.isClientLogsSilent) this.client.logger.error(`Failed to unLoad module '${module_}': `, err);
            }
        }

        return modules;
    }

    public async getModulesFromFiles(options: ClientModuleManagerGetModulesFromFilesOptions): Promise<RecipleModule[]> {
        const modules: RecipleModule[] = [];

        for (const file of options.files) {
            try {
                const resolveFile = await import(file);

                let script: RecipleScript | RecipleModule | undefined = resolveFile instanceof RecipleModule || ClientModuleManager.validateScript(resolveFile)
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
                if (options.dontSkipError) throw err;
                if (!this.client.isClientLogsSilent) this.client.logger.error(`Can't resolve module from: ${file}`, err);
            }
        }

        return modules;
    }

    public static validateScript(script: unknown): script is RecipleScript {
        const s = script as Partial<RecipleScript>;

        if (typeof s !== 'object') return false;
        if (typeof s.versions !== 'string' && !Array.isArray(s.versions)) return false;
        if (typeof s.onStart !== 'function') return false;
        if (s.onLoad && typeof s.onLoad !== 'function') return false;
        if (s.onUnLoad && typeof s.onUnLoad !== 'function') return false;

        return true;
    }

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
