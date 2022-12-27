import { Util } from './Util';
import { Client } from './Client';
import { AnyCommandBuilder, AnyCommandData, CommandType } from '../types/builders';
import { GuildResolvable, RestOrArray, normalizeArray } from 'discord.js';
import { randomUUID } from 'crypto';
import { SlashCommandBuilder } from './builders/SlashCommandBuilder';
import { MessageCommandBuilder } from './builders/MessageCommandBuilder';

export interface RecipleScript {
    versions: string | string[];
    commands?: (AnyCommandBuilder | AnyCommandData)[];
    onStart(client: Client): boolean | Promise<boolean>;
    onLoad?(client: Client): void | Promise<void>;
    onUnload?(client: Client<true>, reason: unknown): void | Promise<void>;
}

export interface ModuleOptions<Metadata = unknown> {
    client: Client;
    script: RecipleScript;
    filePath?: string;
    metadata?: Metadata;
}

export class Module<Metadata = unknown> {
    public readonly id: string;
    public readonly client: Client;
    public readonly commands: AnyCommandBuilder[] = [];
    public readonly script: RecipleScript;
    public readonly filePath?: string;
    public metadata?: Metadata;

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
        return normalizeArray([this.versions] as RestOrArray<string>).some(v => Util.isSupportedVersion(v, Util.version));
    }

    constructor(options: ModuleOptions<Metadata>) {
        this.id = randomUUID();
        this.client = options.client;
        this.script = options.script;
        this.filePath = options.filePath;
        this.metadata = options.metadata;
    }

    public async start(): Promise<boolean> {
        return Promise.resolve(this.script.onStart(this.client));
    }

    public async load(resolveCommands: boolean = true): Promise<void> {
        if (typeof this.script.onLoad === 'function') await this.script.onLoad(this.client);
        if (resolveCommands) this.resolveCommands();
    }

    public async unload(reason?: any): Promise<void> {
        if (typeof this.script.onUnload === 'function') await this.script.onUnload(reason, this.client);
    }

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

            if (!Util.validateCommandBuilder(builder)) throw new Error('Invalid command builder, no name or contains option(s) without name');
            this.commands.push(builder);
        }

        this.client.commands.add(this.commands);
        return this.commands;
    }

    public toString() {
        return this.displayName;
    }
}

