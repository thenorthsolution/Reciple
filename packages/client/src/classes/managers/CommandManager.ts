import { ApplicationCommandDataResolvable, Collection, RESTPostAPIApplicationCommandsJSONBody, RestOrArray, normalizeArray } from 'discord.js';
import { AnySlashCommandBuilder, SlashCommandBuilder, SlashCommandExecuteData, SlashCommandResolvable } from '../builders/SlashCommandBuilder';
import { ContextMenuCommandBuilder, ContextMenuCommandExecuteData, ContextMenuCommandResolvable } from '../builders/ContextMenuCommandBuilder';
import { AnyCommandBuilder, AnyCommandData, AnyCommandExecuteData, ApplicationCommandBuilder, CommandType } from '../../types/commands';
import { MessageCommandBuilder, MessageCommandExecuteData, MessageCommandResovable } from '../builders/MessageCommandBuilder';
import { validateCommand } from '../../utils/assertions/commands/assertions';
import { getCommandBuilderName } from '../../utils/functions';
import { RecipleConfigOptions } from '../../types/options';
import { CommandError } from '../errors/CommandError';
import { ModuleError } from '../errors/ModuleError';
import { RecipleClient } from '../RecipleClient';
import { inspect } from 'util';

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
        commands = normalizeArray(commands);

        commands.forEach(command => {
            try {
                validateCommand(command);
            } catch(err) {
                this.client._throwError(new ModuleError('UnableToAddCommand', getCommandBuilderName(command), command?.name, inspect(err)));
            }
        })

        for (const command of commands) {
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
                    throw new CommandError('UnknownCommand', String(command));
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

    public async registerApplicationCommands(options?: { commands: Omit<RecipleConfigOptions['commands'], 'messageCommand'> } & Pick<RecipleConfigOptions, 'applicationCommandRegister'>): Promise<void> {
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
            },
            applicationRegister: {
                ...this.client.config.applicationCommandRegister,
                ...options?.applicationCommandRegister
            }
        };

        if (commandConfig.applicationRegister?.enabled === false) return;

        const globalCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];
        const guildCommands: Collection<string, RESTPostAPIApplicationCommandsJSONBody[]> = new Collection();

        if (commandConfig.contextMenuCommand.registerCommands?.registerGlobally !== false) globalCommands.push(...this._parseApplicationCommands(this.contextMenuCommands.toJSON()));
        if (commandConfig.slashCommand.registerCommands?.registerGlobally !== false) globalCommands.push(...this._parseApplicationCommands(this.slashCommands.toJSON()));
        if (commandConfig.additionalApplicationCommands.registerCommands?.registerGlobally !== false) globalCommands.push(...this._parseApplicationCommands(this.additionalApplicationCommands));

        commandConfig.contextMenuCommand.registerCommands?.registerToGuilds.forEach(guildId => {
            const data = guildCommands.get(guildId) ?? guildCommands.set(guildId, []).get(guildId);

            data?.push(...this._parseApplicationCommands(this.contextMenuCommands.toJSON()));
        });

        commandConfig.slashCommand.registerCommands?.registerToGuilds.forEach(guildId => {
            const data = guildCommands.get(guildId) ?? guildCommands.set(guildId, []).get(guildId);

            data?.push(...this._parseApplicationCommands(this.slashCommands.toJSON()));
        });

        commandConfig.additionalApplicationCommands.registerCommands?.registerToGuilds.forEach(guildId => {
            const data = guildCommands.get(guildId) ?? guildCommands.set(guildId, []).get(guildId);

            data?.push(...this._parseApplicationCommands(this.additionalApplicationCommands));
        });

        commandConfig.applicationRegister.registerToGuilds?.forEach(guildId => {
            const data = guildCommands.get(guildId) ?? guildCommands.set(guildId, []).get(guildId);

            let commands = [...this._parseApplicationCommands([
                    ...this.contextMenuCommands.toJSON(),
                    ...this.slashCommands.toJSON(),
                    ...this.additionalApplicationCommands
                ])];

                commands = commands.filter(c => !data?.some(d => d.name === c.name));

            data?.push(...commands);
        });

        if (commandConfig.applicationRegister.allowRegisterGlobally !== false) {
            await this.client.application?.commands.set(globalCommands)
                .then(commands => this.client.emit('recipleRegisterApplicationCommands', commands))
                .catch(err => this.client._throwError(err));
        }

        if (commandConfig.applicationRegister.allowRegisterToGuilds || commandConfig.applicationRegister.allowRegisterOnGuilds) {
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
