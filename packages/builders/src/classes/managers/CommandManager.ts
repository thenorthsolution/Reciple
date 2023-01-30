import { ApplicationCommandDataResolvable, Collection, GuildResolvable, RESTPostAPIApplicationCommandsJSONBody, RestOrArray, normalizeArray } from 'discord.js';
import { RecipleClient } from '../RecipleClient';
import { AnySlashCommandBuilder, SlashCommandBuilder, SlashCommandResolvable } from '../builders/SlashCommandBuilder';
import { MessageCommandBuilder, MessageCommandResovable } from '../builders/MessageCommandBuilder';
import { ContextMenuCommandBuilder, ContextMenuCommandResolvable } from '../builders/ContextMenuCommandBuilder';
import { AnyCommandBuilder, AnyCommandData, ApplicationCommandBuilder, CommandType } from '../../types/commands';

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
                    this.contextMenuCommands.set(command.name, ContextMenuCommandBuilder.resolve(command));
                    break;
                case CommandType.MessageCommand:
                    this.messageCommands.set(command.name, MessageCommandBuilder.resolve(command));
                    break;
                case CommandType.SlashCommand:
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
            ? this.contextMenuCommands.toJSON()
            : commandType === CommandType.SlashCommand
                ? this.slashCommands.toJSON()
                : []);

        for (const guildId of guildIds) {
            await this.client.application?.commands.set(commands, guildId)
                .then(commands => this.client.emit('recipleRegisterApplicationCommands', commands, guildId))
                .catch(err => this.client._throwError(err));
        }
    }

    private _parseApplicationCommands(commands: (ApplicationCommandDataResolvable | ApplicationCommandBuilder | RESTPostAPIApplicationCommandsJSONBody)[], setPermissions: boolean = true): (ApplicationCommandDataResolvable | RESTPostAPIApplicationCommandsJSONBody)[] {
        return commands.map(cmd => {
            if ((cmd as ApplicationCommandBuilder)?.toJSON === undefined) return (<unknown>cmd) as ApplicationCommandDataResolvable;
            return (cmd as ApplicationCommandBuilder).toJSON();
        });
    }
}
