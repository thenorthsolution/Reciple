import { randomUUID } from 'crypto';
import { Collection, GuildResolvable, normalizeArray, RestOrArray } from 'discord.js';
import { AnyCommandBuilder, AnyCommandData, CommandBuilderType } from '../types/builders';
import { validateCommandBuilder } from '../util';
import { MessageCommandBuilder } from './builders/MessageCommandBuilder';
import { SlashCommandBuilder } from './builders/SlashCommandBuilder';
import { RecipleClient } from './RecipleClient';

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
    onUnLoad?(reason: unknown, client: RecipleClient<true>): void | Promise<void>;
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
    public readonly commands: Collection<string, AnyCommandBuilder> = new Collection();
    public readonly script: RecipleScript;
    public readonly filePath?: string;
    public metadata?: M;

    get displayName() {
        return this.filePath ?? this.id;
    }

    constructor(options: RecipleModuleOptions<M>) {
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

    public async unLoad(reason?: any): Promise<void> {
        if (typeof this.script.onUnLoad === 'function') await this.script.onUnLoad(reason, this.client);
    }

    public async registerSlashCommands(...guilds: RestOrArray<GuildResolvable>): Promise<void> {
        for (const command of this.commands.toJSON()) {
            if (command.type !== CommandBuilderType.SlashCommand) continue;

            await this.client.applicationCommands.add(command, normalizeArray(guilds));
        }
    }

    public async unregisterSlashCommands(...guilds: RestOrArray<GuildResolvable>): Promise<void> {
        for (const builder of this.commands.toJSON()) {
            if (builder.type !== CommandBuilderType.SlashCommand) continue;

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

    public async updateSlashCommands(...guilds: RestOrArray<GuildResolvable>): Promise<void> {
        for (const builder of this.commands.toJSON()) {
            if (builder.type !== CommandBuilderType.SlashCommand) continue;

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

    public resolveCommands(): Collection<string, AnyCommandBuilder> {
        if (!Array.isArray(this.script?.commands)) return this.commands;

        for (const command of this.script.commands) {
            if (command?.type !== CommandBuilderType.SlashCommand && command?.type !== CommandBuilderType.MessageCommand) continue;

            const builder = command.type === CommandBuilderType.SlashCommand ? SlashCommandBuilder.resolveSlashCommand(command) : MessageCommandBuilder.resolveMessageCommand(command);

            if (!validateCommandBuilder(builder)) throw new Error('Invalid command builder, no name or contains option(s) without name');
            this.commands.set(command.name, builder);
        }

        this.client.commands.add(this.commands.toJSON());
        return this.commands;
    }

    public toString() {
        return this.displayName;
    }
}
