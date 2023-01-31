import { ApplicationCommandDataResolvable, Collection, GuildResolvable, RESTPostAPIApplicationCommandsJSONBody, RestOrArray, normalizeArray } from 'discord.js';
import { AnySlashCommandBuilder, SlashCommandBuilder, SlashCommandExecuteData, SlashCommandResolvable } from '../builders/SlashCommandBuilder';
import { AnyCommandBuilder, AnyCommandData, AnyCommandExecuteData, ApplicationCommandBuilder, CommandType } from '../../types/commands';
import { ContextMenuCommandBuilder, ContextMenuCommandExecuteData, ContextMenuCommandResolvable } from '../builders/ContextMenuCommandBuilder';
import { MessageCommandBuilder, MessageCommandExecuteData, MessageCommandResovable } from '../builders/MessageCommandBuilder';
import { RecipleClient } from '../RecipleClient';

export interface CommandManagerOptions {
    client: RecipleClient;
    contextMenuCommands?: ContextMenuCommandResolvable[];
    messageCommands?: MessageCommandResovable[];
    slashCommands?: SlashCommandResolvable[];
}

export class CommandManager {
    readonly client: RecipleClient;
    readonly contextMenuCommands: Collection<string, ContextMenuCommandBuilder> = new Collection();
    readonly messageCommands: Collection<string, MessageCommandBuilder> = new Collection();
    readonly slashCommands: Collection<string, AnySlashCommandBuilder> = new Collection();
    readonly additionalCommands: ApplicationCommandDataResolvable[] = [];

    get size() { return this.contextMenuCommands.size + this.messageCommands.size + this.slashCommands.size; }

    constructor(options: CommandManagerOptions) {
        this.client = options.client;

        options.contextMenuCommands?.forEach(c => this.contextMenuCommands.set(c.name, ContextMenuCommandBuilder.resolve(c)));
        options.messageCommands?.forEach(c => this.messageCommands.set(c.name, MessageCommandBuilder.resolve(c)));
        options.slashCommands?.forEach(c => this.slashCommands.set(c.name, SlashCommandBuilder.resolve(c)));
    }

    public add(...commands: RestOrArray<AnyCommandBuilder|AnyCommandData>): this {
        for (const command of normalizeArray(commands)) {
            switch (command.commandType) {
                case CommandType.ContextMenuCommand:
                    if (!this.client.config.commands.contextMenuCommand.enabled) break;

                    this.contextMenuCommands.set(command.name, ContextMenuCommandBuilder.resolve(command));
                    break;
                case CommandType.MessageCommand:
                    if (!this.client.config.commands.messageCommand.enabled) break;

                    this.messageCommands.set(command.name, MessageCommandBuilder.resolve(command));
                    break;
                case CommandType.SlashCommand:
                    if (!this.client.config.commands.slashCommand.enabled) break;

                    this.slashCommands.set(command.name, SlashCommandBuilder.resolve(command));
                    break;
                default:
                    throw new Error('Unknown command type');
            }
        }

        return this;
    }

    public addAdditionalCommands(...commands: RestOrArray<ApplicationCommandDataResolvable>): this {
        for (const command of normalizeArray(commands)) {
            this.additionalCommands.push(command);
        }

        return this;
    }

    public get<Metadata = unknown>(command: string, type: CommandType.ContextMenuCommand): ContextMenuCommandBuilder<Metadata> | undefined;
    public get<Metadata = unknown>(command: string, type: CommandType.MessageCommand): MessageCommandBuilder<Metadata> | undefined;
    public get<Metadata = unknown>(command: string, type: CommandType.SlashCommand): AnySlashCommandBuilder<Metadata> | undefined;
    public get<Metadata = unknown>(command: string, type: CommandType): AnyCommandBuilder<Metadata> | undefined {
        switch (type) {
            case CommandType.ContextMenuCommand:
                return this.contextMenuCommands.get(command) as ContextMenuCommandBuilder<Metadata>;
            case CommandType.MessageCommand:
                return (this.messageCommands.get(command.toLowerCase()) ?? this.messageCommands.find(c => c.aliases.some(a => a == command?.toLowerCase()))) as MessageCommandBuilder<Metadata>;
            case CommandType.SlashCommand:
                return this.slashCommands.get(command) as SlashCommandBuilder<Metadata>;
            default:
                throw new TypeError('Unknown command type');
        }
    }

    public async registerApplicationCommands(commandType: CommandType.ContextMenuCommand|CommandType.SlashCommand, guildIds: string[]): Promise<void> {
        const commands = this._parseApplicationCommands(commandType === CommandType.ContextMenuCommand
            ? this.client.config.commands.contextMenuCommand.registerCommands
                ? this.contextMenuCommands.toJSON()
                : []
            : commandType === CommandType.SlashCommand
                ? this.client.config.commands.slashCommand.registerCommands
                    ? this.slashCommands.toJSON()
                    : []
                : []);

        if (!commands.length
            &&
            (
                commandType === CommandType.ContextMenuCommand && !this.client.config.commands.contextMenuCommand.registerEmptyCommandList
                ||
                commandType === CommandType.SlashCommand && !this.client.config.commands.slashCommand.registerEmptyCommandList
            )
           ) return;

        for (const guildId of guildIds) {
            await this.client.application?.commands.set(commands, guildId)
                .then(commands => this.client.emit('recipleRegisterApplicationCommands', commands, guildId))
                .catch(err => this.client._throwError(err));
        }
    }

    public async execute<Metadata = unknown>(command: string, type: CommandType.ContextMenuCommand): Promise<ContextMenuCommandExecuteData<Metadata>|undefined>;
    public async execute<Metadata = unknown>(command: string, type: CommandType.MessageCommand): Promise<MessageCommandExecuteData<Metadata>|undefined>
    public async execute<Metadata = unknown>(command: string, type: CommandType.SlashCommand): Promise<SlashCommandExecuteData<Metadata>|undefined>
    public async execute<Metadata = unknown>(command: string, type: CommandType): Promise<AnyCommandExecuteData<Metadata>|undefined> {
        const builder = type === CommandType.ContextMenuCommand
            ? this.contextMenuCommands.get(command)
            : type === CommandType.MessageCommand
                ? this.messageCommands.get(command)
                : type === CommandType.SlashCommand
                    ? this.slashCommands.get(command)
                    : undefined;

        if (!builder) return;
    } 

    private _parseApplicationCommands(commands: (ApplicationCommandDataResolvable | ApplicationCommandBuilder)[]): RESTPostAPIApplicationCommandsJSONBody[] {
        return commands.map(cmd => {
            if ((cmd as ApplicationCommandBuilder)?.toJSON === undefined) return (<unknown>cmd) as RESTPostAPIApplicationCommandsJSONBody;
            return (cmd as ApplicationCommandBuilder).toJSON();
        });
    }
}
