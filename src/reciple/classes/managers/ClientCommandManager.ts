import { ApplicationCommandData, Collection, GuildResolvable, normalizeArray, RestOrArray } from 'discord.js';
import { AnyCommandBuilder, AnyCommandData, AnySlashCommandBuilder, CommandBuilderType, MessageCommandData, SlashCommandData } from '../../types/builders';
import { MessageCommandBuilder } from '../builders/MessageCommandBuilder';
import { SlashCommandBuilder } from '../builders/SlashCommandBuilder';
import { RecipleClient } from '../RecipleClient';
import { ApplicationCommandBuilder } from './ApplicationCommandManager';

export interface ClientCommandManagerOptions {
    client: RecipleClient;
    messageCommands?: (MessageCommandBuilder|MessageCommandData)[];
    slashCommands?: (AnySlashCommandBuilder|SlashCommandData)[];
}

export class ClientCommandManager {
    readonly client: RecipleClient;
    readonly slashCommands: Collection<string, AnySlashCommandBuilder> = new Collection();
    readonly messageCommands: Collection<string, MessageCommandBuilder> = new Collection();
    readonly additionalApplicationCommands: (ApplicationCommandBuilder|ApplicationCommandData)[] = [];

    constructor(options: ClientCommandManagerOptions) {
        this.client = options.client;

        options.slashCommands?.forEach(e => this.slashCommands.set(e.name, SlashCommandBuilder.resolveSlashCommand(e)));
        options.messageCommands?.forEach(e => this.messageCommands.set(e.name, MessageCommandBuilder.resolveMessageCommand(e)));
    }

    /**
     * Add command to command manager
     * @param commands Any command data or builder
     */
    public add(...commands: RestOrArray<AnyCommandBuilder|AnyCommandData>): this {
        for (const command of normalizeArray(commands)) {
            if (command.type === CommandBuilderType.SlashCommand) {
                this.slashCommands.set(command.name, SlashCommandBuilder.resolveSlashCommand(command));
            } else if (command.type === CommandBuilderType.MessageCommand) {
                this.messageCommands.set(command.name, MessageCommandBuilder.resolveMessageCommand(command));
            }
        }

        return this;
    }

    /**
     * Get command builder by name or alias if it's a message command 
     * @param command Command name
     * @param type Command type
     */
    public get(command: string, type?: undefined): AnyCommandBuilder|undefined;
    public get(command: string, type?: CommandBuilderType.MessageCommand): MessageCommandBuilder|undefined;
    public get(command: string, type?: CommandBuilderType.SlashCommand): SlashCommandBuilder|undefined;
    public get(command: string, type?: CommandBuilderType): AnyCommandBuilder|undefined {
        switch (type) {
            case CommandBuilderType.SlashCommand:
                return this.slashCommands.get(command);
            case CommandBuilderType.MessageCommand:
                return this.messageCommands.get(command.toLowerCase())
                    ?? (this.client.config.commands.messageCommand.allowCommandAlias
                        ? this.messageCommands.find(c => c.aliases.some(a => a == command?.toLowerCase()))
                        : undefined
                    );
            default:
                throw new TypeError('Unknown command type');
        }
    }

    /**
     * Register application commands
     * @param guilds Register application commands to guilds
     */
    public async registerApplicationCommands(...guilds: RestOrArray<GuildResolvable>): Promise<this> {
        guilds = normalizeArray(guilds);

        await this.client.applicationCommands.set([...this.slashCommands.toJSON(), ...this.additionalApplicationCommands], (
            guilds.length
                ? guilds
                : normalizeArray([this.client.config.commands.slashCommand.guilds] as RestOrArray<string>)
        ));

        this.client.emit('RegisterApplicationCommands');
        return this;
    }
}
