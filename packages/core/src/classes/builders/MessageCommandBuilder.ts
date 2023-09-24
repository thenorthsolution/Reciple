import { MessageCommandOptionBuilder, MessageCommandOptionResolvable } from './MessageCommandOptionBuilder';
import { botHasPermissionsToExecute, hasExecutePermissions } from '../../utils/permissions';
import { MessageCommandOptionManager } from '../managers/MessageCommandOptionManager';
import { BaseCommandBuilder, BaseCommandBuilderData } from './BaseCommandBuilder';
import { Awaitable, If, Message, RestOrArray, normalizeArray } from 'discord.js';
import { CommandCooldownData } from '../managers/CommandCooldownManager';
import { MessageCommandValidateOptionData } from '../../types/options';
import { CommandHaltData, CommandHaltReason } from '../../types/halt';
import { BaseCommandData, CommandType } from '../../types/commands';
import { CommandData, getCommand } from 'fallout-utility';
import { RecipleClient } from '../RecipleClient';

export interface MessageCommandExecuteData<Options extends boolean = true> {
    /**
     * The type of command.
     */
    commandType: CommandType.MessageCommand;
    /**
     * The current bot client. This is the client that the command is being executed on.
     */
    client: RecipleClient<true>;
    /**
     * The command message. This is the message that triggered the command.
     */
    message: Message;
    /**
     * The options object can be used to access the values of the command options.
     */
    options: If<Options, MessageCommandOptionManager>;
    /**
     * This is an object that contains the raw data for the command.
     */
    command: CommandData;
    /**
     * This is the builder that was used to create the command.
     */
    builder: MessageCommandBuilder;
}

export type MessageCommandHaltData = CommandHaltData<CommandType.MessageCommand>;

export type MessageCommandExecuteFunction = (executeData: MessageCommandExecuteData) => Awaitable<void>;
export type MessageCommandPreconditionFunction = (executeData: MessageCommandExecuteData) => Awaitable<boolean>;
export type MessageCommandHaltFunction = (haltData: MessageCommandHaltData) => Awaitable<boolean>;

export type MessageCommandResovable = MessageCommandBuilder|MessageCommandData;

export interface MessageCommandData extends BaseCommandBuilderData, BaseCommandData {
    commandType: CommandType.MessageCommand;
    /**
     * Command aliases
     */
    aliases?: string[];
    halt?: MessageCommandHaltFunction;
    execute?: MessageCommandExecuteFunction;
    /**
     * Validates every command options
     */
    validateOptions?: boolean;
    /**
     * Allow execute in DM channels
     */
    dmPermission?: boolean;
    /**
     * Allow execute by bot users
     */
    userBotPermission?: boolean;
    /**
     * Command options
     */
    options?: MessageCommandOptionResolvable[];
}

export interface MessageCommandBuilder extends BaseCommandBuilder {
    halt?: MessageCommandHaltFunction;
    execute?: MessageCommandExecuteFunction;
    setHalt(halt?: MessageCommandHaltFunction|null): this;
    setExecute(execute?: MessageCommandExecuteFunction|null): this;
}

export class MessageCommandBuilder extends BaseCommandBuilder implements MessageCommandData {
    readonly commandType: CommandType.MessageCommand = CommandType.MessageCommand;

    public name: string = '';
    public aliases: string[] = [];
    public description: string = '';
    public validateOptions: boolean = false;
    public dmPermission: boolean = false;
    public userBotPermission: boolean = false;
    public options: MessageCommandOptionBuilder[] = [];

    constructor(data?: Omit<Partial<MessageCommandData>, 'commandType'>) {
        super(data);

        if (data?.name !== undefined) this.setName(data.name);
        if (data?.aliases !== undefined) this.setAliases(data.aliases);
        if (data?.description !== undefined) this.setDescription(data.description);
        if (data?.dmPermission !== undefined) this.setDmPermission(data.dmPermission);
        if (data?.userBotPermission !== undefined) this.setUserBotPermission(data.userBotPermission);
        if (data?.validateOptions !== undefined) this.setValidateOptions(data.validateOptions);
        if (data?.options !== undefined) this.setOptions(data.options);
    }

    /**
     * Sets the name of the command.
     * @param name The command name
     */
    public setName(name: string): this {
        this.name = name;
        return this;
    }

    /**
     * Adds aliases to the command.
     * @param aliases The command aliases
     */
    public addAliases(...aliases: RestOrArray<string>): this {
        aliases = normalizeArray(aliases);

        if (aliases.some(a => !a || typeof a !== 'string' || a.match(/^\s+$/))) throw new TypeError('Aliases must be strings and should not contain whitespaces');
        if (this.name && aliases.some(a => a == this.name)) throw new TypeError('Aliases cannot have same name to its real command name');

        this.aliases = [...new Set(aliases.map(s => s.toLowerCase()))];
        return this;
    }

    /**
     * Sets the aliases for the command
     * @param aliases The command aliases
     */
    public setAliases(...aliases: RestOrArray<string>): this {
        this.aliases = [];

        return this.addAliases(...aliases);
    }

    /**
     * Sets whether the command can be used in direct messages.
     * @param dmPermission Is allowed in DM
     */
    public setDmPermission(dmPermission: boolean): this {
        this.dmPermission = dmPermission;
        return this;
    }

    /**
     * Sets whether the command can be executed by bots.
     * @param userBotPermission Is executable by bots
     */
    public setUserBotPermission(userBotPermission: boolean): this {
        this.userBotPermission = userBotPermission;
        return this;
    }

    /**
     * Sets whether the command options should be validated.
     * @param validateOptions Is command options validate enabled
     */
    public setValidateOptions(validateOptions: boolean): this {
        this.validateOptions = validateOptions;
        return this;
    }

    /**
     * Sets the description of the command.
     * @param description The command description
     */
    public setDescription(description: string): this {
        this.description = description;
        return this;
    }

    /**
     * Adds options to the command.
     * @param options The command options
     */
    public addOptions(...options: RestOrArray<MessageCommandOptionResolvable | ((builder: MessageCommandOptionBuilder) => MessageCommandOptionBuilder)>): this {
        for (const optionResolvable of normalizeArray(options)) {
            this.addOption(optionResolvable);
        }

        return this;
    }

    /**
     * Sets options to the command.
     * @param options The command options
     */
    public setOptions(...options: RestOrArray<MessageCommandOptionResolvable | ((builder: MessageCommandOptionBuilder) => MessageCommandOptionBuilder)>): this {
        this.options = [];
        return this.addOptions(normalizeArray(options));
    }

    /**
     * Add a single option to the command.
     * @param optionResolvable The command option
     */
    public addOption(optionResolvable: MessageCommandOptionResolvable | ((builder: MessageCommandOptionBuilder) => MessageCommandOptionBuilder)): this {
        const option = typeof optionResolvable === 'function'
            ? optionResolvable(new MessageCommandOptionBuilder())
            : MessageCommandOptionBuilder.resolve(optionResolvable);

        if (this.options.find(o => o.name === option.name)) throw new TypeError('An option with name "' + option.name + '" already exists.');
        if (this.options.length > 0 && !this.options[this.options.length - 1 < 0 ? 0 : this.options.length - 1].required && option.required) throw new TypeError('All required options must be before optional options.');

        this.options.push(option);

        return this;
    }

    public toJSON(): MessageCommandData {
        return {
            ...super.toCommandData(),
            commandType: this.commandType,
            name: this.name,
            aliases: this.aliases,
            description: this.description,
            validateOptions: this.validateOptions,
            dmPermission: this.dmPermission,
            userBotPermission: this.userBotPermission,
            options: this.options.map(o => o.toJSON()),
            halt: this.halt,
            execute: this.execute
        };
    }

    /**
     * Resolve message command data and returns a builder
     * @param messageCommandResolvable The message command data
     */
    public static resolve(messageCommandResolvable: MessageCommandResovable): MessageCommandBuilder {
        return this.isMessageCommandBuilder(messageCommandResolvable) ? messageCommandResolvable : new MessageCommandBuilder(messageCommandResolvable);
    }

    public static isMessageCommandBuilder(data: any): data is MessageCommandBuilder {
        return data instanceof MessageCommandBuilder;
    }

    /**
     * Get validated command option values
     * @param options Validate options data
     */
    public static async validateCommandOptions(options: MessageCommandValidateOptionData): Promise<MessageCommandOptionManager> {
        const validated: MessageCommandOptionManager = new MessageCommandOptionManager();
        if (!options.command.options) return validated;

        for (let i = 0; i < options.command.options.length; i++) {
            const arg = options.args[i];
            validated.set(options.command.options[i].name, await MessageCommandOptionBuilder.validateOptionValue(options.command.options[i], options.message, arg));
        }

        return validated;
    }

    /**
     * Execute a message command
     * @param client Current bot client
     * @param message The command message
     * @param prefix The command prefix
     * @param separator The command args separator
     * @param command Command builder resolvable of the command you wanna execute
     */
    public static async execute(client: RecipleClient, message: Message, prefix?: string, separator?: string, command?: MessageCommandResovable): Promise<MessageCommandExecuteData|undefined> {
        if (client.config.commands?.messageCommand?.enabled === false || !message.content) return;

        const commandData = getCommand(message.content, prefix ?? client.config.commands?.messageCommand?.prefix ?? '!', separator ?? client.config.commands?.messageCommand?.commandArgumentSeparator ?? ' ');
        if (!commandData || !commandData.name) return;

        const builder = command ? this.resolve(command) : client.commands.get(commandData.name, CommandType.MessageCommand);
        if (!builder || (!builder.dmPermission && !message.inGuild()) || (!builder.userBotPermission && (message.author.bot || message.author.system))) return;

        const executeData: MessageCommandExecuteData<boolean> = {
            commandType: builder.commandType,
            builder,
            command: commandData,
            message,
            options: null,
            client
        };

        const commandOptions = await MessageCommandBuilder.validateCommandOptions({
            client,
            message,
            command: builder,
            args: commandData.args
        }).catch((err: Error) => err);

        if (commandOptions instanceof Error) {
            const isHandled = await client._haltCommand(builder, {
                commandType: builder.commandType,
                reason: CommandHaltReason.ValidateOptionError,
                error: commandOptions,
                executeData
            });

            if (!isHandled) client._throwError(commandOptions);
            return;
        }

        executeData.options = commandOptions;

        if (client.config.commands?.slashCommand?.enableCooldown !== false && builder.cooldown) {
            const cooldownData: Omit<CommandCooldownData, 'endsAt'> = {
                command: builder.name,
                user: message.author,
                type: builder.commandType
            };

            if (!client.cooldowns.isCooledDown(cooldownData)) {
                client.cooldowns.add({ ...cooldownData, endsAt: new Date(Date.now() + builder.cooldown) });
            } else {
                await client._haltCommand(builder, {
                    commandType: builder.commandType,
                    reason: CommandHaltReason.Cooldown,
                    cooldownData: client.cooldowns.get(cooldownData)!,
                    executeData
                });
                return;
            }
        }

        if (!message.inGuild() && message.member?.permissions && builder.requiredMemberPermissions && hasExecutePermissions({ builder, memberPermissions: message.member?.permissions })) {
            await client._haltCommand(builder, {
                commandType: builder.commandType,
                reason: CommandHaltReason.MissingMemberPermissions,
                executeData
            });
            return;
        }

        if (builder.validateOptions) {
            if (commandOptions.some(o => o.invalid)) {
                await client._haltCommand(builder, {
                    commandType: builder.commandType,
                    reason: CommandHaltReason.InvalidArguments,
                    executeData,
                    invalidArguments: new MessageCommandOptionManager(commandOptions.filter(o => o.invalid).map(o => [o.name, o]))
                });
                return;
            }

            if (commandOptions.some(o => o.missing)) {
                await client._haltCommand(builder, {
                    commandType: builder.commandType,
                    reason: CommandHaltReason.MissingArguments,
                    executeData,
                    missingArguments: new MessageCommandOptionManager(commandOptions.filter(o => o.missing).map(o => [o.name, o]))
                });
                return;
            }
        }

        if (builder.requiredBotPermissions && message.inGuild()) {
            const isBotExecuteAllowed = botHasPermissionsToExecute((message.channel || message.guild)!, builder.requiredBotPermissions);
            if (!isBotExecuteAllowed) {
                await client._haltCommand(builder, {
                    commandType: builder.commandType,
                    reason: CommandHaltReason.MissingBotPermissions,
                    executeData
                });
                return;
            }
        }

        const precondition = await client._executeCommandPrecondition(builder, executeData);
        if (!precondition) return;

        return (await client._executeCommand(builder, executeData)) ? executeData : undefined;
    }
}