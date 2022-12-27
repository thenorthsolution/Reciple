import { ApplicationCommandDataResolvable, Collection, GuildResolvable, RestOrArray, normalizeArray } from 'discord.js';
import { MessageCommandBuilder, MessageCommandResolvable } from '../builders/MessageCommandBuilder';
import { SlashCommandBuilder, SlashCommandResolvable } from '../builders/SlashCommandBuilder';
import { Client } from '../Client';
import { AnyCommandBuilder, AnyCommandData, AnySlashCommandBuilder, CommandType } from '../../types/builders';

export interface CommandManagerOptions {
    client: Client;
    slashCommands?: SlashCommandResolvable[];
    messageCommands?: MessageCommandResolvable[];
}

export class CommandManager  {
    readonly client: Client;
    readonly slashCommands: Collection<string, AnySlashCommandBuilder> = new Collection();
    readonly messageCommands: Collection<string, MessageCommandBuilder> = new Collection();
    readonly additionalApplicationCommands: ApplicationCommandDataResolvable[] = [];

    constructor(options: CommandManagerOptions) {
        this.client = options.client;

        options.slashCommands?.forEach(e => this.slashCommands.set(e.name, SlashCommandBuilder.resolveSlashCommand(e)));
        options.messageCommands?.forEach(e => this.messageCommands.set(e.name, MessageCommandBuilder.resolveMessageCommand(e)));
    }

    public add(...commands: RestOrArray<AnyCommandBuilder | AnyCommandData>): this {
        for (const command of normalizeArray(commands)) {
            if (command instanceof SlashCommandBuilder || command.type === CommandType.SlashCommand) {
                this.slashCommands.set(command.name, SlashCommandBuilder.resolveSlashCommand(command));
            } else if (command instanceof MessageCommandBuilder || command.type === CommandType.MessageCommand) {
                this.messageCommands.set(command.name, MessageCommandBuilder.resolveMessageCommand(command));
            } else {
                throw new Error(`Unknown reciple command type`);
            }
        }

        return this;
    }

    public addAddtionalApplicationCommand(...commands: RestOrArray<ApplicationCommandDataResolvable>): this {
        this.additionalApplicationCommands.push(...normalizeArray(commands));
        return this;
    }

    public get<Metadata = unknown>(command: string, type: CommandType.SlashCommand): AnySlashCommandBuilder<Metadata> | undefined;
    public get<Metadata = unknown>(command: string, type: CommandType.MessageCommand): MessageCommandBuilder<Metadata> | undefined;
    public get<Metadata = unknown>(command: string, type: CommandType): AnyCommandBuilder<Metadata> | undefined {
        switch (type) {
            case CommandType.SlashCommand:
                return this.slashCommands.get(command) as AnySlashCommandBuilder<Metadata>;
            case CommandType.MessageCommand:
                return (this.messageCommands.get(command.toLowerCase()) ?? this.messageCommands.find(builder => builder.aliases.some(alias => alias === command.toLowerCase()))) as MessageCommandBuilder<Metadata>;
            default:
                throw new TypeError('Unknown command type');
        }
    }

    public async registerApplicationCommands(...guilds: RestOrArray<GuildResolvable>): Promise<this> {
        guilds = normalizeArray(guilds);
        guilds = guilds.length ? guilds : [];

        await this.client.applicationCommands.set([...this.client.applicationCommands.commands], guilds);
        this.client.emit('recipleRegisterApplicationCommands');
        return this;
    }
}
