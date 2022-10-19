import { randomUUID } from 'crypto';
import { Collection, GuildResolvable, normalizeArray, RestOrArray } from 'discord.js';
import { existsSync, lstatSync, mkdirSync, readdirSync } from 'fs';
import path from 'path';
import wildcardMatch from 'wildcard-match';
import { cwd } from '../../flags';
import { AnyCommandBuilder, AnyCommandData, CommandBuilderType } from '../../types/builders';
import { ModuleManagerResolveFilesOptions } from '../../types/paramOptions';
import {  validateCommandBuilder } from '../../util';
import { isSupportedVersion, rawVersion, version } from '../../version';
import { MessageCommandBuilder } from '../builders/MessageCommandBuilder';
import { SlashCommandBuilder } from '../builders/SlashCommandBuilder';
import { RecipleClient } from '../RecipleClient';

/**
 * Reciple script object
 */
 export interface RecipleScript {
    /**
     * Supported reciple versions
     */
    versions: string | string[];
    /**
     * Module commands
     */
    commands?: (AnyCommandBuilder|AnyCommandData)[];
    /**
     * Action on module start
     * @param client Bot client
     */
    onStart(client: RecipleClient<false>): boolean|Promise<boolean>;
    /**
     * Action on bot ready
     * @param client Bot client
     */
    onLoad?(client: RecipleClient<true>): void|Promise<void>;
}

/**
 * Reciple module object
 */
export interface RecipleModule {
    /**
     * Module Id
     */
    id: string;
    /**
     * Module script
     */
    script: RecipleScript;
    /**
     * Module local information
     */
    info: {
        /**
         * Module file name
         */
        filename?: string;
        /**
         * Module local file path
         */
        path?: string;
    }
}

export interface ResolvedModule extends RecipleModule {
    commands: AnyCommandBuilder[];
}

export interface ResolvedScriptCommands {
    script: RecipleScript;
    commands: AnyCommandBuilder[];
}

export interface ClientModuleManagerOptions {
    client: RecipleClient;
    modules?: (RecipleModule & { id?: string })[];
}

export class ClientModuleManager {
    readonly client: RecipleClient;
    readonly modules: Collection<string, ResolvedModule> = new Collection();

    constructor(options: ClientModuleManagerOptions) {
        this.client = options.client;

        options.modules?.forEach(m => {
            if (!m.id) m.id = randomUUID();
            this.modules.set(m.id, this.resolveModule(m));
        });
    }

    public async startModulesFromFiles(options: ModuleManagerResolveFilesOptions): Promise<ResolvedModule[]> {
        const modules = await this.resolveModulesFromFiles(options);

        for (const module_ of modules) {
            try {
                await this.startModule(module_);
            } catch (err) {
                if (options.dontSkipError) throw err;
                if (!this.client.isClientLogsSilent) this.client.logger.err(`Cannot start module ${ClientModuleManager.getModuleDisplayId(module_)}:`, err);
            }
        }

        return modules;
    }

    public async resolveModulesFromFiles(options: ModuleManagerResolveFilesOptions): Promise<ResolvedModule[]> {
        const modules: ResolvedModule[] = [];
        const isVersionCheckDisabled = (options.disabeVersionCheck || this.client.config.disableVersionCheck);

        for (const file of options.files) {
            const moduleFileName = path.basename(file);
            const moduleDirPath = path.dirname(file);
            const id = randomUUID();

            let script: RecipleScript;

            try {
                const resolveModuleFile = await import(file);

                script = resolveModuleFile?.default ?? resolveModuleFile;

                const module_ = this.resolveModule({
                    id,
                    script,
                    info: {
                        filename: moduleFileName,
                        path: moduleDirPath
                    }
                }, isVersionCheckDisabled);

                modules.push(module_);

                if (!this.client.isClientLogsSilent) this.client.logger.log(`Resolved ${file}`);
            } catch(err) {
                if (options.dontSkipError) throw err;
                if (!this.client.isClientLogsSilent) this.client.logger.err(`Cannot resolve module file ${file}:`, err);
            }
        }

        return modules;
    }

    public resolveScriptCommands(...modules: RestOrArray<RecipleScript>): ResolvedScriptCommands[] {
        const resolvedCommands: ResolvedScriptCommands[] = [];

        for (const script of normalizeArray(modules)) {
            const commands: AnyCommandBuilder[] = [];

            if (Array.isArray(script?.commands)) {
                for (const command of script.commands) {
                    if (command.type === CommandBuilderType.MessageCommand) {
                        commands.push(MessageCommandBuilder.resolveMessageCommand(command));
                    } else if (command.type === CommandBuilderType.SlashCommand) {
                        commands.push(SlashCommandBuilder.resolveSlashCommand(command));
                    }
                }
            }

            const invalidBuilders = commands.some(c => !validateCommandBuilder(c));

            if (invalidBuilders) throw new Error(`Module script commands contains a command builder without name or option name`);

            resolvedCommands.push({
                script,
                commands
            });
        }

        return resolvedCommands;
    }

    public async loadAll(registerApplicationCommands?: boolean, ...registerApplicationCommandsGuilds: RestOrArray<GuildResolvable>): Promise<void> {
        await Promise.all(this.modules.map(async m => {
            if (typeof m.script?.onLoad === 'function') {
                try {
                    await Promise.resolve(m.script.onLoad(this.client)).catch(err => { throw err; });
                } catch (err) {
                    this.modules.delete(m.id);

                    if (!this.client.isClientLogsSilent) this.client.logger.error(`Error loading ${m.info.filename ?? 'unknown module'}:`, err);
                    return;
                }
            }

            this.client.commands.add(m.commands);

            if (!this.client.isClientLogsSilent) this.client.logger.log(`Loaded module: ${ClientModuleManager.getModuleDisplayId(m)}`);
        }));

        if (!this.client.isClientLogsSilent) {
            this.client.logger.info(`${this.modules.size} modules loaded.`);
            this.client.logger.info(`${this.client.commands.messageCommands.size} message commands loaded.`);
            this.client.logger.info(`${this.client.commands.slashCommands.size} slash commands loaded.`);
        }

        if (registerApplicationCommands) this.client.commands.registerApplicationCommands(normalizeArray(registerApplicationCommandsGuilds));
    }

    public async startModule(mod: ResolvedModule): Promise<void> {
        let err;

        const identifier = ClientModuleManager.getModuleDisplayId(mod);

        if (!this.client.isClientLogsSilent) this.client.logger.log(`Starting Module: ${identifier}`);

        const start = await Promise.resolve(mod.script.onStart(this.client)).catch(e => err = e);

        if (err) throw err;
        if (!start) throw new Error(`Module ${identifier} returned 'false' on start`);

        this.modules.set(mod.id, mod);
    }

    public resolveModule(mod: RecipleModule, disabeVersionCheck?: boolean): ResolvedModule {
        const identifier = ClientModuleManager.getModuleDisplayId(mod);

        if (!disabeVersionCheck && !mod?.script?.versions?.length) throw new Error(`Module ${identifier} does not contain supported versions`);
        if (typeof mod.script?.onStart !== 'function') throw new Error(`Module ${identifier} does not have a valid 'onStart' method`);

        const versions: string[] = normalizeArray([mod.script.versions] as RestOrArray<string>);
        const commands: AnyCommandBuilder[] = this.resolveScriptCommands(mod.script)[0].commands;

        if (!disabeVersionCheck && !versions.some(v => isSupportedVersion(v, version))) throw new Error(`Module ${identifier} does not support 'reciple@${rawVersion}'`);

        return {
            ...mod,
            commands,
        }
    }

    public async getModuleFiles(...folders: RestOrArray<string>): Promise<string[]> {
        const modules: string[] = [];

        for (const dir of (normalizeArray(folders).length ? normalizeArray(folders) : normalizeArray([this.client.config.modulesFolder] as RestOrArray<string>))) {
            if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
            if (!lstatSync(dir).isDirectory()) continue;

            modules.push(...readdirSync(dir).map(file => path.join(cwd, dir, file)).filter(file => file.endsWith('.js') || file.endsWith('.cjs')));
        }

        return modules.filter(file => !this.client.config.ignoredFiles.some(ignored => wildcardMatch(ignored, path.basename(file))));
    }

    public static getModuleDisplayId(mod: RecipleModule): string {
        return mod.info.path && mod.info.filename ? path.join(mod.info.path, mod.info.filename) : mod.id;
    }
}
