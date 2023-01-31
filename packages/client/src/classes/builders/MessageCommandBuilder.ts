import { MessageCommandOptionBuilder, MessageCommandOptionResolvable } from './MessageCommandOptionBuilder';
import { Awaitable, If, Message, RestOrArray, isValidationEnabled, normalizeArray } from 'discord.js';
import { MessageCommandOptionManager } from '../managers/MessageCommandOptionManager';
import { BaseCommandBuilder, BaseCommandBuilderData } from './BaseCommandBuilder';
import { BaseCommandData, CommandType } from '../../types/commands';
import { CommandHaltData, CommandHaltReason } from '../../types/halt';
import { RecipleClient } from '../RecipleClient';
import { CommandData, getCommand } from 'fallout-utility';
import { MessageCommandValidateOptionData } from '../../types/options';
import { CommandCooldownData } from '../managers/CommandCooldownManager';
import { botHasPermissionsToExecute, memberHasExecutePermissions } from '../utils/permissions';

export interface MessageCommandExecuteData<Options extends boolean = true> {
    commandType: CommandType.MessageCommand;
    client: RecipleClient;
    message: Message;
    options: If<Options, MessageCommandOptionManager>;
    command: CommandData;
    builder: MessageCommandBuilder;
}

export type MessageCommandHaltData = CommandHaltData<CommandType.MessageCommand>;

export type MessageCommandExecuteFunction = (executeData: MessageCommandExecuteData) => Awaitable<void>;
export type MessageCommandHaltFunction = (haltData: MessageCommandHaltData) => Awaitable<boolean>;

export type MessageCommandResovable = MessageCommandBuilder|MessageCommandData;

export interface MessageCommandData extends BaseCommandBuilderData, BaseCommandData {
    commandType: CommandType.MessageCommand;
    aliases: string[];
    halt?: MessageCommandHaltFunction;
    execute?: MessageCommandExecuteFunction;
    validateOptions: boolean;
    dmPermission: boolean;
    userBotPermission: boolean;
    options: MessageCommandOptionResolvable[];
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
    public halt?: MessageCommandHaltFunction;
    public execute?: MessageCommandExecuteFunction;

    constructor(data?: Omit<Partial<MessageCommandData>, 'commandType'>) {
        super(data);

        if (data?.name !== undefined) this.setName(data.name);
        if (data?.description !== undefined) this.setDescription(data.description);
    }

    public setName(name: string): this {
        this.name = name;
        return this;
    }

    public addAliases(...aliases: RestOrArray<string>): this {
        aliases = normalizeArray(aliases);

        if (aliases.some(a => !a || typeof a !== 'string' || a.match(/^\s+$/))) throw new TypeError('Aliases must be strings and should not contain whitespaces');
        if (this.name && aliases.some(a => a == this.name)) throw new TypeError('Aliases cannot have same name to its real command name');

        this.aliases = [...new Set(aliases.map(s => s.toLowerCase()))];
        return this;
    }

    public setAliases(...aliases: RestOrArray<string>): this {
        this.aliases = [];

        return this.addAliases(...aliases);
    }

    public setDmPermission(dmPermission: boolean): this {
        this.dmPermission = dmPermission;
        return this;
    }

    public setUserBotPermission(userBotPermission: boolean): this {
        this.userBotPermission = userBotPermission;
        return this;
    }

    public setValidateOptions(validateOptions: boolean): this {
        this.validateOptions = validateOptions;
        return this;
    }

    public setDescription(description: string): this {
        this.description = description;
        return this;
    }

    public addOptions(...options: RestOrArray<MessageCommandOptionResolvable | ((builder: MessageCommandOptionBuilder) => MessageCommandOptionBuilder)>): this {
        for (const optionResolvable of normalizeArray(options)) {
            this.addOption(optionResolvable);
        }

        return this;
    }

    public setOptions(...options: RestOrArray<MessageCommandOptionResolvable | ((builder: MessageCommandOptionBuilder) => MessageCommandOptionBuilder)>): this {
        this.options = [];
        return this.addOptions(normalizeArray(options));
    }

    public addOption(optionResolvable: MessageCommandOptionResolvable | ((builder: MessageCommandOptionBuilder) => MessageCommandOptionBuilder)): this {
        const option = typeof optionResolvable === 'function'
            ? optionResolvable(new MessageCommandOptionBuilder())
            : MessageCommandOptionBuilder.resolve(optionResolvable);

        if (isValidationEnabled()) {
            if (this.options.find(o => o.name === option.name)) throw new TypeError('An option with name "' + option.name + '" already exists.');
            if (this.options.length > 0 && !this.options[this.options.length - 1 < 0 ? 0 : this.options.length - 1].required && option.required) throw new TypeError('All required options must be before optional options.');
        }

        this.options.push(option);

        return this;
    }

    public setHalt(halt?: MessageCommandHaltFunction|null): this {
        this.halt = halt || undefined;
        return this;
    }

    public setExecute(execute?: MessageCommandExecuteFunction|null): this {
        this.execute = execute || undefined;
        return this;
    }

    public toJSON(): MessageCommandData {
        return {
            ...this.toCommandData(),
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

    public static resolve(messageCommandResolvable: MessageCommandResovable): MessageCommandBuilder {
        return messageCommandResolvable instanceof MessageCommandBuilder ? messageCommandResolvable : new MessageCommandBuilder(messageCommandResolvable);
    }

    public static async validateCommandOptions(options: MessageCommandValidateOptionData): Promise<MessageCommandOptionManager> {
        const validated: MessageCommandOptionManager = new MessageCommandOptionManager();

        for (let i = 0; i < options.command.options.length; i++) {
            const arg = options.args[i];
            validated.set(options.command.options[i].name, await MessageCommandOptionBuilder.validateOptionValue(options.command.options[i], options.message));
        }

        return validated;
    }

    public static async execute(client: RecipleClient, message: Message, prefix?: string, separator?: string): Promise<MessageCommandExecuteData|undefined> {
        if (!client.config.commands.messageCommand.enabled || !message.content) return;

        const commandData = getCommand(message.content, prefix ?? client.config.commands.messageCommand.prefix, separator ?? client.config.commands.messageCommand.commandArgumentSeparator);
        if (!commandData || !commandData.name) return;

        const builder = client.commands.get(commandData.name, CommandType.MessageCommand);
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

        if (client.config.commands.slashCommand.enableCooldown && builder.cooldown) {
            const cooldownData: Omit<CommandCooldownData, 'endsAt'> = {
                command: builder.name,
                user: message.author,
                type: builder.commandType
            };

            const isCooledDown = client.cooldowns.isCooledDown(cooldownData);
            if (!isCooledDown) {
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

        if (!message.inGuild() && message.member?.permissions && builder.requiredMemberPermissions && memberHasExecutePermissions({ builder, memberPermissions: message.member?.permissions })) {
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

        return await client._executeCommand(builder, executeData) ? executeData : undefined;
    }
}
