import { ApplicationCommandDataResolvable, Collection, RESTPostAPIApplicationCommandsJSONBody, RestOrArray, normalizeArray } from 'discord.js';
import { AnySlashCommandBuilder, SlashCommandBuilder, SlashCommandExecuteData, SlashCommandResolvable } from '../builders/SlashCommandBuilder';
import { AnyCommandBuilder, AnyCommandData, AnyCommandExecuteData, ApplicationCommandBuilder, CommandType } from '../../types/commands';
import { ContextMenuCommandBuilder, ContextMenuCommandExecuteData, ContextMenuCommandResolvable } from '../builders/ContextMenuCommandBuilder';
import { MessageCommandBuilder, MessageCommandExecuteData, MessageCommandResovable } from '../builders/MessageCommandBuilder';
import { RecipleClient } from '../RecipleClient';
import { RecipleCommandsInteractionBasedConfigOptions, RecipleConfigOptions } from '../..';
import { CommandError } from '../errors/CommandError';

export interface CommandManagerOptions {
    client: RecipleClient;
    contextMenuCommands?: ContextMenuCommandResolvable[];
    messageCommands?: MessageCommandResovable[];
    slashCommands?: SlashCommandResolvable[];
    additionalApplicationCommands?: ApplicationCommandDataResolvable[];
}

export class CommandManager {
    readonly client: RecipleClient;
    readonly contextMenuCommands: Collection<string, ContextMenuCommandBuilder> = new Collection();
    readonly messageCommands: Collection<string, MessageCommandBuilder> = new Collection();
    readonly slashCommands: Collection<string, AnySlashCommandBuilder> = new Collection();
    readonly additionalApplicationCommands: ApplicationCommandDataResolvable[] = [];

    get size() { return this.contextMenuCommands.size + this.messageCommands.size + this.slashCommands.size; }

    constructor(options: CommandManagerOptions) {
        this.client = options.client;

        options.contextMenuCommands?.forEach(c => this.contextMenuCommands.set(c.name, ContextMenuCommandBuilder.resolve(c)));
        options.messageCommands?.forEach(c => this.messageCommands.set(c.name, MessageCommandBuilder.resolve(c)));
        options.slashCommands?.forEach(c => this.slashCommands.set(c.name, SlashCommandBuilder.resolve(c)));

        this.additionalApplicationCommands = options.additionalApplicationCommands ?? [];
    }

    public add(...commands: RestOrArray<AnyCommandBuilder|AnyCommandData>): this {
        for (const command of normalizeArray(commands)) {
            switch (command.commandType) {
                case CommandType.ContextMenuCommand:
                    if (this.client.config.commands?.contextMenuCommand?.enabled === false) break;

                    this.contextMenuCommands.set(command.name, ContextMenuCommandBuilder.resolve(command));
                    break;
                case CommandType.MessageCommand:
                    if (this.client.config.commands?.messageCommand?.enabled === false) break;

                    this.messageCommands.set(command.name, MessageCommandBuilder.resolve(command));
                    break;
                case CommandType.SlashCommand:
                    if (this.client.config.commands?.slashCommand?.enabled === false) break;

                    this.slashCommands.set(command.name, SlashCommandBuilder.resolve(command));
                    break;
                default:
                    throw new CommandError('UnknownCommand');
            }
        }

        return this;
    }

    public addAdditionalApplicationCommands(...commands: RestOrArray<ApplicationCommandDataResolvable>): this {
        for (const command of normalizeArray(commands)) {
            this.additionalApplicationCommands.push(command);
        }

        return this;
    }

    public get(command: string, type: CommandType.ContextMenuCommand): ContextMenuCommandBuilder | undefined;
    public get(command: string, type: CommandType.MessageCommand): MessageCommandBuilder | undefined;
    public get(command: string, type: CommandType.SlashCommand): AnySlashCommandBuilder | undefined;
    public get(command: string, type: CommandType): AnyCommandBuilder | undefined {
        switch (type) {
            case CommandType.ContextMenuCommand:
                return this.contextMenuCommands.get(command);
            case CommandType.MessageCommand:
                return (this.messageCommands.get(command) ?? this.messageCommands.find(c => c.aliases.some(a => a == command?.toLowerCase())));
            case CommandType.SlashCommand:
                return this.slashCommands.get(command);
            default:
                throw new TypeError('Unknown command type');
        }
    }

    public async registerApplicationCommands(options?: { commands?: Partial<RecipleCommandsInteractionBasedConfigOptions>; applicationCommandRegister: Partial<RecipleCommandsInteractionBasedConfigOptions['registerCommands']>; }): Promise<void> {
        const commandConfig = {
            contextMenuCommand: {
                ...this.client.config.commands?.contextMenuCommand,
                ...options?.commands
            },
            slashCommand: {
                ...this.client.config.commands?.slashCommand,
                ...options?.commands
            },
            additionalApplicationCommands: {
                ...this.client.config.commands?.contextMenuCommand,
                ...options?.commands
            }
        };

        const globalCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];
        const guildCommands: Collection<string, RESTPostAPIApplicationCommandsJSONBody[]> = new Collection();

        if (commandConfig.contextMenuCommand.registerCommands?.registerGlobally !== false) globalCommands.push(...this._parseApplicationCommands(this.contextMenuCommands.toJSON()));
        if (commandConfig.slashCommand.registerCommands?.registerGlobally !== false) globalCommands.push(...this._parseApplicationCommands(this.slashCommands.toJSON()));
        if (commandConfig.additionalApplicationCommands.registerCommands?.registerGlobally !== false) globalCommands.push(...this._parseApplicationCommands(this.additionalApplicationCommands));

        commandConfig.contextMenuCommand.registerCommands?.registerToGuilds.forEach(guildId => {
            guildCommands.set(guildId, [...(guildCommands.get(guildId) ?? []), ...this._parseApplicationCommands(this.contextMenuCommands.toJSON())]);
        });

        commandConfig.slashCommand.registerCommands?.registerToGuilds.forEach(guildId => {
            guildCommands.set(guildId, [...(guildCommands.get(guildId) ?? []), ...this._parseApplicationCommands(this.slashCommands.toJSON())]);
        });

        commandConfig.additionalApplicationCommands.registerCommands?.registerToGuilds.forEach(guildId => {
            guildCommands.set(guildId, [...(guildCommands.get(guildId) ?? []), ...this._parseApplicationCommands(this.additionalApplicationCommands)]);
        });

        if (options?.applicationCommandRegister?.registerGlobally ?? this.client.config.applicationCommandRegister?.allowRegisterGlobally !== false) {
            await this.client.application?.commands.set(globalCommands)
                .then(commands => this.client.emit('recipleRegisterApplicationCommands', commands))
                .catch(err => this.client._throwError(err));
        }

        if (options?.applicationCommandRegister.registerToGuilds ?? this.client.config.applicationCommandRegister?.allowRegisterOnGuilds !== false) {
            for (const guildBasedCommands of guildCommands.map((commands, guildId) => ({ guildId, commands }))) {
                await this.client.application?.commands.set(guildBasedCommands.commands, guildBasedCommands.guildId)
                    .then(commands => this.client.emit('recipleRegisterApplicationCommands', commands, guildBasedCommands.guildId))
                    .catch(err => this.client._throwError(err));
            }
        }
    }

    public async execute(command: string, type: CommandType.ContextMenuCommand): Promise<ContextMenuCommandExecuteData|undefined>;
    public async execute(command: string, type: CommandType.MessageCommand): Promise<MessageCommandExecuteData|undefined>
    public async execute(command: string, type: CommandType.SlashCommand): Promise<SlashCommandExecuteData|undefined>
    public async execute(command: string, type: CommandType): Promise<AnyCommandExecuteData|undefined> {
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