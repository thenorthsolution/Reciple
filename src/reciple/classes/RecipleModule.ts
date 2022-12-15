import { AnyCommandBuilder, AnyCommandData, CommandType } from '../types/builders';
import { GuildResolvable, normalizeArray, RestOrArray } from 'discord.js';
import { MessageCommandBuilder } from './builders/MessageCommandBuilder';
import { SlashCommandBuilder } from './builders/SlashCommandBuilder';
import { validateCommandBuilder } from '../util';
import { RecipleClient } from './RecipleClient';
import { isSupportedVersion } from '../version';
import { randomUUID } from 'crypto';

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
    commands?: (AnyCommandBuilder | AnyCommandData)[];
    /**
     * Action on module start
     * @param client Bot client
     */
    onStart(client: RecipleClient<false>): boolean | Promise<boolean>;
    /**
     * Action on bot ready
     * @param client Bot client
     */
    onLoad?(client: RecipleClient<true>): void | Promise<void>;
    /**
     * Action when unloading this module
     * @param reason Unload reason
     * @param client Bot client
     */
    onUnload?(reason: unknown, client: RecipleClient<true>): void | Promise<void>;
}

export interface RecipleModuleOptions<M = unknown> {
    client: RecipleClient;
    script: RecipleScript;
    filePath?: string;
    metadata?: M;
}

export class RecipleModule<M = unknown> {
    public readonly id: string;
    public readonly client: RecipleClient;
    public readonly commands: AnyCommandBuilder[] = [];
    public readonly script: RecipleScript;
    public readonly filePath?: string;
    public metadata?: M;

    get versions() {
        return this.script.versions;
    }

    get onStart() {
        return this.script.onStart;
    }

    get onLoad() {
        return this.script.onLoad;
    }

    get onUnload() {
        return this.script.onUnload;
    }

    get displayName() {
        return this.filePath ?? this.id;
    }

    get isSupported() {
        return normalizeArray([this.versions] as RestOrArray<string>).some(v => isSupportedVersion(v, this.client.version));
    }

    constructor(options: RecipleModuleOptions<M>) {
        this.id = randomUUID();
        this.client = options.client;
        this.script = options.script;
        this.filePath = options.filePath;
        this.metadata = options.metadata;
    }

    /**
     * Execute module's {@link RecipleScript.onStart}
     */
    public async start(): Promise<boolean> {
        return Promise.resolve(this.script.onStart(this.client));
    }

    /**
     * Execute module's {@link RecipleScript.onLoad}
     * @param resolveCommands Parse commands
     */
    public async load(resolveCommands: boolean = true): Promise<void> {
        if (typeof this.script.onLoad === 'function') await this.script.onLoad(this.client);
        if (resolveCommands) this.resolveCommands();
    }

    /**
     * Execute module's {@link RecipleScript.onUnload}
     * @param reason Unload reason
     */
    public async unload(reason?: any): Promise<void> {
        if (typeof this.script.onUnload === 'function') await this.script.onUnload(reason, this.client);
    }

    /**
     * Register application commands from this module
     * @param guilds Register to certain guilds
     */
    public async registerSlashCommands(...guilds: RestOrArray<GuildResolvable>): Promise<void> {
        for (const command of this.commands) {
            if (command.type !== CommandType.SlashCommand) continue;

            await this.client.applicationCommands.add(command, normalizeArray(guilds));
        }
    }

    /**
     * Unregister application commands from this module
     * @param guilds Unregister from certain guilds
     */
    public async unregisterSlashCommands(...guilds: RestOrArray<GuildResolvable>): Promise<void> {
        for (const builder of this.commands) {
            if (builder.type !== CommandType.SlashCommand) continue;

            if (normalizeArray(guilds).length) {
                for (const guild of normalizeArray(guilds)) {
                    const command = this.client.applicationCommands.get(builder, guild);

                    if (command) await this.client.applicationCommands.remove(command, guild);
                }

                continue;
            }

            const command = this.client.applicationCommands.get(builder);
            if (command) await this.client.applicationCommands.remove(command);
        }
    }

    /**
     * Update registered application commands of this module
     * @param guilds update commands from certain guilds
     */
    public async updateSlashCommands(...guilds: RestOrArray<GuildResolvable>): Promise<void> {
        for (const builder of this.commands) {
            if (builder.type !== CommandType.SlashCommand) continue;

            if (normalizeArray(guilds).length) {
                for (const guild of normalizeArray(guilds)) {
                    const command = this.client.applicationCommands.get(builder, guild);

                    if (command) await this.client.applicationCommands.edit(command, builder, guild);
                }

                continue;
            }

            const command = this.client.applicationCommands.get(builder);
            if (command) await this.client.applicationCommands.edit(command, builder);
        }
    }

    /**
     * Resolve module commands
     */
    public resolveCommands(): AnyCommandBuilder[] {
        if (!Array.isArray(this.script?.commands)) return this.commands;

        for (const command of this.script.commands) {
            if (command?.type !== CommandType.SlashCommand && command?.type !== CommandType.MessageCommand) continue;

            const builder = command.type === CommandType.SlashCommand ? SlashCommandBuilder.resolveSlashCommand(command) : MessageCommandBuilder.resolveMessageCommand(command);

            if (!validateCommandBuilder(builder)) throw new Error('Invalid command builder, no name or contains option(s) without name');
            this.commands.push(builder);
        }

        this.client.commands.add(this.commands);
        return this.commands;
    }

    public toString() {
        return this.displayName;
    }
}
