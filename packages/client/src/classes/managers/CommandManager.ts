import { ApplicationCommand, ApplicationCommandDataResolvable, ChatInputCommandInteraction, Collection, ContextMenuCommandInteraction, Message, RESTPostAPIApplicationCommandsJSONBody, RestOrArray, normalizeArray } from 'discord.js';
import { AnySlashCommandBuilder, SlashCommandBuilder, SlashCommandPreconditionFunction, SlashCommandResolvable } from '../builders/SlashCommandBuilder';
import { ContextMenuCommandBuilder, ContextMenuCommandPreconditionFunction, ContextMenuCommandResolvable } from '../builders/ContextMenuCommandBuilder';
import { AnyCommandBuilder, AnyCommandData, AnyCommandExecuteData, AnyCommandPreconditionFunction, ApplicationCommandBuilder, CommandType } from '../../types/commands';
import { MessageCommandBuilder, MessageCommandPreconditionFunction, MessageCommandResovable } from '../builders/MessageCommandBuilder';
import { createUnknownCommandTypeErrorOptions } from '../../utils/errorCodes';
import { validateCommand } from '../../utils/assertions/commands/assertions';
import { RecipleConfigOptions } from '../../types/options';
import { RecipleError } from '../errors/RecipleError';
import { RecipleClient } from '../RecipleClient';

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

    public globalContextMenuCommandPrecondition?: ContextMenuCommandPreconditionFunction;
    public globalMessageCommandPrecondition?: MessageCommandPreconditionFunction;
    public globalSlashCommandPrecondition?: SlashCommandPreconditionFunction;

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

        commands.forEach(command => validateCommand(command));

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
                    throw new RecipleError(createUnknownCommandTypeErrorOptions(command));
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

    public setGlobalPrecondition(commandType: CommandType.ContextMenuCommand, precondition: null|undefined|ContextMenuCommandPreconditionFunction): void;
    public setGlobalPrecondition(commandType: CommandType.MessageCommand, precondition: null|undefined|MessageCommandPreconditionFunction): void;
    public setGlobalPrecondition(commandType: CommandType.SlashCommand, precondition: null|undefined|SlashCommandPreconditionFunction): void;
    public setGlobalPrecondition(commandType: CommandType, precondition: null|undefined|AnyCommandPreconditionFunction): void {
        precondition = precondition || undefined;

        switch (commandType) {
            case CommandType.ContextMenuCommand:
                this.globalContextMenuCommandPrecondition = precondition as ContextMenuCommandPreconditionFunction;
                break;
            case CommandType.MessageCommand:
                this.globalMessageCommandPrecondition = precondition as MessageCommandPreconditionFunction;
                break;
            case CommandType.SlashCommand:
                this.globalSlashCommandPrecondition = precondition as SlashCommandPreconditionFunction;
                break;
        }
    }

    public getGlobalPrecondition(commandType: CommandType.ContextMenuCommand): ContextMenuCommandPreconditionFunction;
    public getGlobalPrecondition(commandType: CommandType.MessageCommand): MessageCommandPreconditionFunction;
    public getGlobalPrecondition(commandType: CommandType.SlashCommand): SlashCommandPreconditionFunction;
    public getGlobalPrecondition(commandType: CommandType): AnyCommandPreconditionFunction;
    public getGlobalPrecondition(commandType: CommandType): AnyCommandPreconditionFunction {
        switch (commandType) {
            case CommandType.ContextMenuCommand:
                return this.globalContextMenuCommandPrecondition || (() => true);
            case CommandType.MessageCommand:
                return this.globalMessageCommandPrecondition || (() => true);
            case CommandType.SlashCommand:
                return this.globalSlashCommandPrecondition || (() => true);
        }
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

        if (commandConfig.contextMenuCommand.registerCommands?.registerGlobally !== false) globalCommands.push(...this._parseApplicationCommands([...this.contextMenuCommands.values()]));
        if (commandConfig.slashCommand.registerCommands?.registerGlobally !== false) globalCommands.push(...this._parseApplicationCommands([...this.slashCommands.values()]));
        if (commandConfig.additionalApplicationCommands.registerCommands?.registerGlobally !== false) globalCommands.push(...this._parseApplicationCommands(this.additionalApplicationCommands));

        commandConfig.contextMenuCommand.registerCommands?.registerToGuilds.forEach(guildId => {
            const data = guildCommands.get(guildId) ?? guildCommands.set(guildId, []).get(guildId);

            data?.push(...this._parseApplicationCommands([...this.contextMenuCommands.values()]));
        });

        commandConfig.slashCommand.registerCommands?.registerToGuilds.forEach(guildId => {
            const data = guildCommands.get(guildId) ?? guildCommands.set(guildId, []).get(guildId);

            data?.push(...this._parseApplicationCommands([...this.slashCommands.values()]));
        });

        commandConfig.additionalApplicationCommands.registerCommands?.registerToGuilds.forEach(guildId => {
            const data = guildCommands.get(guildId) ?? guildCommands.set(guildId, []).get(guildId);

            data?.push(...this._parseApplicationCommands(this.additionalApplicationCommands));
        });

        commandConfig.applicationRegister.registerToGuilds?.forEach(guildId => {
            const data = guildCommands.get(guildId) ?? guildCommands.set(guildId, []).get(guildId);

            let commands = [...this._parseApplicationCommands([
                    ...this.contextMenuCommands.values(),
                    ...this.slashCommands.values(),
                    ...this.additionalApplicationCommands
                ])];

                commands = commands.filter(c => !data?.some(d => d.name === c.name));

            data?.push(...commands);
        });

        if (commandConfig.applicationRegister.allowRegisterGlobally !== false) {
            if (commandConfig.applicationRegister.registerEmptyCommands || globalCommands.length) {
                await this.client.application?.commands.set(globalCommands)
                    .then(commands => this.client.emit('recipleRegisterApplicationCommands', commands))
                    .catch(err => this.client._throwError(err));
            }
        }

        if (commandConfig.applicationRegister.allowRegisterToGuilds || commandConfig.applicationRegister.allowRegisterOnGuilds) {
            for (const [guildId, commands] of guildCommands) {
                if (commandConfig.applicationRegister.registerEmptyCommands || commands.length) {
                    await this.client.application?.commands.set(commands, guildId)
                        .then(commands => this.client.emit('recipleRegisterApplicationCommands', commands, guildId))
                        .catch(err => this.client._throwError(err));
                }
            }
        }
    }

    public async execute(trigger: ContextMenuCommandInteraction|Message|ChatInputCommandInteraction): Promise<AnyCommandExecuteData|undefined> {
        if (trigger instanceof ContextMenuCommandInteraction) {
            return ContextMenuCommandBuilder.execute(this.client, trigger);
        } else if (trigger instanceof Message) {
            return MessageCommandBuilder.execute(this.client, trigger);
        } else if (trigger instanceof ChatInputCommandInteraction) {
            return SlashCommandBuilder.execute(this.client, trigger);
        }
    }

    public getApplicationCommand(command: string|AnyCommandData|AnyCommandBuilder, guildId?: string): ApplicationCommand|undefined {
        const name = typeof command === 'string' ? command : command.name;
        return this.client.application?.commands.cache.find(c => c.name === name && (guildId ? c.guildId === guildId : c.guildId === null));
    }

    public async fetchApplicationCommand(command: string|AnyCommandData|AnyCommandBuilder, guildId?: string): Promise<ApplicationCommand|undefined> {
        const name = typeof command === 'string' ? command : command.name;
        const commands = await this.client.application?.commands.fetch({ guildId });

        return commands?.find(c => c.name !== name);
    }

    private _parseApplicationCommands(commands: (ApplicationCommandDataResolvable | ApplicationCommandBuilder)[]): RESTPostAPIApplicationCommandsJSONBody[] {
        return commands.map(cmd => {
            if ((cmd as ApplicationCommandBuilder)?.toJSON === undefined) return (<unknown>cmd) as RESTPostAPIApplicationCommandsJSONBody;
            return (cmd as ApplicationCommandBuilder).toJSON();
        });
    }
}
