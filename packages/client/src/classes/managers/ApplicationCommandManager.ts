import { ApplicationCommand, ApplicationCommandData, ApplicationCommandDataResolvable, ContextMenuCommandBuilder, SlashCommandBuilder as DiscordJsSlashCommandBuilder, GuildResolvable, RESTPostAPIApplicationCommandsJSONBody, RestOrArray, normalizeArray } from 'discord.js';
import { AnySlashCommandBuilder } from '../../types/builders';
import { Client } from '../Client';

export interface ApplicationCommandManagerOptions {
    client: Client;
}

export type ApplicationCommandBuilder = AnySlashCommandBuilder|ContextMenuCommandBuilder|DiscordJsSlashCommandBuilder;

export class ApplicationCommandManager {
    readonly client: Client;

    get commands() {
        return [...this.client.commands.additionalApplicationCommands, ...this.client.commands.slashCommands.toJSON()];
    }

    get size() {
        return this.commands.length;
    }

    constructor(options: ApplicationCommandManagerOptions) {
        this.client = options.client;
    }

    public async set(commands: (ApplicationCommandBuilder | ApplicationCommandDataResolvable)[], ...guilds: RestOrArray<GuildResolvable>): Promise<void> {
        guilds = normalizeArray(guilds);

        if (!this.client.isReady()) throw new Error('Client is not ready');
        if (guilds && guilds.length > 1) {
            for (const guild of guilds) {
                await this.set(commands, guild);
            }

            return;
        }

        let guild = guilds?.shift();
        guild = guild ? this.client.guilds.resolveId(guild) || undefined : undefined;

        const applicationCommands = await this.client.application.commands.set(commands, guild!);
        this.client.emit('recipleSetApplicationCommands', applicationCommands, guild ?? null);
    }

    public async add(command: ApplicationCommandBuilder | ApplicationCommandDataResolvable, ...guilds: RestOrArray<GuildResolvable>): Promise<void> {
        guilds = normalizeArray(guilds);

        if (!this.client.isReady()) throw new Error('Client is not ready');
        if (!command) throw new Error('Command is undefined');
        if (guilds && guilds.length > 1) {
            for (const guild of guilds) {
                await this.add(command, guild);
            }

            return;
        }

        let guild = guilds?.shift();
        guild = guild ? this.client.guilds.resolveId(guild) || undefined : undefined;

        const newCommand = await this.client.application.commands.create(command, guild);
        this.client.emit('recipleAddApplicationCommand', newCommand, guild ?? null);
    }

    public async remove(command: string|ApplicationCommand, ...guilds: RestOrArray<GuildResolvable>): Promise<void> {
        guilds = normalizeArray(guilds);

        if (!this.client.isReady()) throw new Error('Client is not ready');
        if (!command) throw new Error('Command is undefined');
        if (guilds && guilds.length > 1) {
            for (const guild of guilds) {
                await this.remove(command, guild);
            }

            return;
        }

        let guild = guilds?.shift();
        guild = guild ? this.client.guilds.resolveId(guild) || undefined : undefined;

        const deletedCommand = await this.client.application.commands.delete(command, guild);
        this.client.emit('recipleRemoveApplicationCommand', deletedCommand || command, guild ?? null);
    }

    public async edit(command: string | ApplicationCommand, newCommand: ApplicationCommandBuilder | ApplicationCommandDataResolvable, ...guilds: RestOrArray<GuildResolvable>): Promise<void> {
        guilds = normalizeArray(guilds);

        if (!this.client.isReady()) throw new Error('Client is not ready');
        if (!command) throw new Error('Command is undefined');
        if (guilds && guilds.length > 1) {
            for (const guild of guilds) {
                await this.edit(command, newCommand, guild);
            }

            return;
        }

        let guild = guilds?.shift();
        guild = guild ? this.client.guilds.resolveId(guild) || undefined : undefined;

        const editedCommand = await this.client.application.commands.edit(command, newCommand, guild!);
        this.client.emit('recipleEditApplicationCommand', editedCommand, guild ?? null);
    }

    public get(command: ApplicationCommandData | ApplicationCommandBuilder | string, guild?: GuildResolvable): ApplicationCommand | undefined {
        const commands = guild ? this.client.guilds.resolve(guild)?.commands.cache : this.client.application?.commands.cache;
        if (!commands) return;

        return commands.find(cmd => (typeof command === 'string' ? cmd.id === command || cmd.name === command : cmd.name === command.name || (command instanceof ApplicationCommand && cmd.id === command.id)));
    }

    public async fetch(commandId: string, guild?: GuildResolvable): Promise<ApplicationCommand> {
        const manager = guild ? this.client.guilds.resolve(guild)?.commands : this.client.application?.commands;
        if (!manager) throw new Error('Guild not found in cache');

        return manager.fetch(commandId);
    }

    protected parseCommands(commands: (ApplicationCommandDataResolvable | ApplicationCommandBuilder | RESTPostAPIApplicationCommandsJSONBody)[]): (ApplicationCommandDataResolvable | RESTPostAPIApplicationCommandsJSONBody)[] {
        return commands.map(cmd => {
            if ((cmd as ApplicationCommandBuilder)?.toJSON === undefined) return (<unknown>cmd) as ApplicationCommandDataResolvable;
            return (cmd as ApplicationCommandBuilder).toJSON();
        });
    }
}
