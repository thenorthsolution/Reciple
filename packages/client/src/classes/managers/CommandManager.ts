import { ApplicationCommand, ApplicationCommandDataResolvable, ChatInputCommandInteraction, Collection, ContextMenuCommandInteraction, mergeDefault, Message, RESTPostAPIApplicationCommandsJSONBody, RestOrArray, normalizeArray } from 'discord.js';
import { AnyCommandBuilder, AnyCommandData, AnyCommandExecuteData, AnyCommandPreconditionFunction, ApplicationCommandBuilder, CommandType } from '../../types/commands';
import { AnySlashCommandBuilder, SlashCommandBuilder, SlashCommandPreconditionFunction, SlashCommandResolvable } from '../builders/SlashCommandBuilder';
import { ContextMenuCommandBuilder, ContextMenuCommandPreconditionFunction, ContextMenuCommandResolvable } from '../builders/ContextMenuCommandBuilder';
import { MessageCommandBuilder, MessageCommandPreconditionFunction, MessageCommandResovable } from '../builders/MessageCommandBuilder';
import { RecipleCommandsRegisterOptions } from '../../types/options';
import { CommandAssertions } from '../assertions/CommandAssertions';
import { BaseCommandBuilderData } from '../builders/BaseCommandBuilder';
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

        commands.forEach(command => CommandAssertions.validateCommand(command));

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
                    throw new RecipleError(RecipleError.createUnknownCommandTypeErrorOptions(command));
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

    public async registerApplicationCommands(options?: RecipleCommandsRegisterOptions): Promise<{ global: Collection<string, ApplicationCommand>; guilds: Collection<string, Collection<string, ApplicationCommand>> }> {
        const store = { global: new Collection<string, ApplicationCommand>(), guilds: new Collection<string, Collection<string, ApplicationCommand>>() };
        const config = mergeDefault({ ...this.client.config.commands, ...this.client.config.applicationCommandRegister }, options) as RecipleCommandsRegisterOptions;

        if (config?.enabled === false) return store;

        const contextMenuCommands = this._parseApplicationCommands(options?.contextMenus?.commands ?? [...this.contextMenuCommands.values()]);
        const slashCommands = this._parseApplicationCommands(options?.slashCommands?.commands ?? [...this.slashCommands.values()]);
        const additionalApplicationCommands = this._parseApplicationCommands(options?.additionalApplicationCommands?.commands ?? [...this.additionalApplicationCommands]);

        const globalCommands: ApplicationCommandDataResolvable[] = [];
        const guildCommands: Collection<string, Set<ApplicationCommandDataResolvable>> = new Collection();

        if (config.allowRegisterGlobally !== false) {
            if (config.contextMenus?.registerCommands?.registerGlobally) globalCommands.push(...contextMenuCommands);
            if (config.slashCommands?.registerCommands?.registerGlobally) globalCommands.push(...slashCommands);
            if (config.additionalApplicationCommands?.registerCommands?.registerGlobally) globalCommands.push(...additionalApplicationCommands);
        }

        if (config.allowRegisterToGuilds ?? config.allowRegisterOnGuilds) {
            for (const guildId of config.contextMenus?.registerCommands?.registerToGuilds ?? []) {
                const commands = guildCommands.get(guildId) ?? guildCommands.set(guildId, new Set()).get(guildId)!;
                contextMenuCommands.forEach(c => commands.add(c));
            }

            for (const guildId of config.slashCommands?.registerCommands?.registerToGuilds ?? []) {
                const commands = guildCommands.get(guildId) ?? guildCommands.set(guildId, new Set()).get(guildId)!;
                slashCommands.forEach(c => commands.add(c));
            }

            for (const guildId of config.additionalApplicationCommands?.registerCommands?.registerToGuilds ?? []) {
                const commands = guildCommands.get(guildId) ?? guildCommands.set(guildId, new Set()).get(guildId)!;
                additionalApplicationCommands.forEach(c => commands.add(c));
            }

            for (const guildId of config.registerToGuilds ?? []) {
                const commands = guildCommands.get(guildId) ?? guildCommands.set(guildId, new Set()).get(guildId)!;
                [...contextMenuCommands, ...slashCommands, ...additionalApplicationCommands].forEach(c => commands.add(c));
            }
        }

        if (config.allowRegisterGlobally !== false && (config.registerEmptyCommands || globalCommands.length)) {
            const commands = await this.client.application!.commands.set(globalCommands)
                .then(cmds => {
                    this.client.emit('recipleRegisterApplicationCommands', cmds);
                    return cmds;
                })
                .catch(err => this.client._throwError(err));

            if (commands) commands.forEach(c => store.global.set(c.id, c));
        }

        if (config.allowRegisterToGuilds ?? config.allowRegisterOnGuilds) {
            for (const [guildId, APIcommands] of guildCommands) {
                if (!config.registerEmptyCommands && !APIcommands.size) continue;

                const commands = await this.client.application!.commands.set([...APIcommands.values()], guildId)
                    .then(cmds => {
                        this.client.emit('recipleRegisterApplicationCommands', cmds, guildId);
                        return cmds;
                    })
                    .catch(err => this.client._throwError(err));

                store.guilds.set(guildId, commands ?? new Collection());
            }
        }

        return store;
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
            const data = (cmd as ApplicationCommandBuilder).toJSON() as RESTPostAPIApplicationCommandsJSONBody & BaseCommandBuilderData;

            data.requiredBotPermissions = undefined;
            data.requiredMemberPermissions = undefined;
            data.execute = undefined;
            data.halt = undefined;

            return data;
        });
    }
}
