import { Awaitable, JSONEncodable, RestOrArray, Message, normalizeArray, isJSONEncodable } from 'discord.js';
import { CommandHaltReason, CommandType } from '../../types/constants';
import { MessageCommandValidators } from '../validators/MessageCommandValidators';
import { BaseCommandBuilder, BaseCommandBuilderData } from './BaseCommandBuilder';
import { MessageCommandOptionBuilder, MessageCommandOptionResolvable } from './MessageCommandOptionBuilder';
import { MessageCommandOptionValidators } from '../validators/MessageCommandOptionValidators';
import { CommandHaltData } from '../../types/structures';
import { RecipleClient } from '../structures/RecipleClient';
import { MessageCommandOptionManager } from '../managers/MessageCommandOptionManager';
import { CommandData, getCommand } from 'fallout-utility/commands';
import { CooldownData } from '../structures/Cooldown';

export interface MessageCommandExecuteData {
    type: CommandType.MessageCommand;
    client: RecipleClient<true>;
    message: Message<boolean>;
    parserData: CommandData;
    options: MessageCommandOptionManager;
    builder: MessageCommandBuilder;
}

export type MessageCommandHaltData = CommandHaltData<CommandType.MessageCommand>;

export type MessageCommandExecuteFunction = (executeData: MessageCommandExecuteData) => Awaitable<void>;
export type MessageCommandHaltFunction = (haltData: MessageCommandHaltData) => Awaitable<boolean>;

export interface MessageCommandBuilderData extends BaseCommandBuilderData {
    command_type: CommandType.MessageCommand;
    halt?: MessageCommandHaltFunction;
    execute: MessageCommandExecuteFunction;
    name: string;
    description: string;
    aliases?: string[];
    /**
     * @default true
     */
    validate_options?: boolean;
    /**
     * @default false
     */
    dm_permission?: boolean;
    /**
     * @default false
     */
    allow_bot?: boolean;
    options?: MessageCommandOptionResolvable[];
}

export interface MessageCommandBuilder extends BaseCommandBuilder {
    halt?: MessageCommandHaltFunction;
    execute: MessageCommandExecuteFunction;

    setHalt(halt: MessageCommandHaltFunction|null): this;
    setExecute(execute: MessageCommandExecuteFunction): this;
}

export class MessageCommandBuilder extends BaseCommandBuilder {
    public readonly command_type: CommandType.MessageCommand = CommandType.MessageCommand;
    public name: string = '';
    public description: string = '';
    public aliases?: string[] = [];
    public validate_options?: boolean = true;
    public dm_permission?: boolean = false;
    public allow_bot?: boolean = false;
    public options?: MessageCommandOptionBuilder[] = [];

    constructor(data?: Omit<Partial<MessageCommandBuilderData>, 'command_type'>) {
        super(data);

        if (data?.name) this.setName(data.name);
        if (data?.description) this.setDescription(data.description);
        if (data?.aliases) this.setAliases(data.aliases);
        if (data?.validate_options) this.setValidateOptions(data.validate_options);
        if (data?.dm_permission) this.setDMPermission(data.dm_permission);
        if (data?.allow_bot) this.setAllowBot(data.allow_bot);
        if (data?.options) this.setOptions(data.options);
    }

    public setName(name: string): this {
        MessageCommandValidators.isValidName(name);
        this.name = name;
        return this;
    }

    public setDescription(description: string): this {
        MessageCommandValidators.isValidDescription(description);
        this.description = description;
        return this;
    }

    public addAliases(...aliases: RestOrArray<string>): this {
        aliases = normalizeArray(aliases);
        MessageCommandValidators.isValidAliases(aliases);
        this.aliases?.push(...aliases);
        return this;
    }

    public setAliases(...aliases: RestOrArray<string>): this {
        aliases = normalizeArray(aliases);
        MessageCommandValidators.isValidAliases(aliases);
        this.aliases = aliases;
        return this;
    }

    public setValidateOptions(enabled: boolean): this {
        MessageCommandValidators.isValidValidateOptions(enabled);
        this.validate_options = enabled;
        return this;
    }

    public setDMPermission(DMPermission: boolean): this {
        MessageCommandValidators.isValidDMPermission(DMPermission);
        this.dm_permission = DMPermission;
        return this;
    }

    public setAllowBot(enabled: boolean): this {
        MessageCommandValidators.isValidAllowBot(enabled);
        this.allow_bot = enabled;
        return this;
    }

    public addOption(option: MessageCommandOptionResolvable|((builder: MessageCommandOptionBuilder) => MessageCommandOptionBuilder)): this {
        option = typeof option === 'function' ? option(new MessageCommandOptionBuilder()) : MessageCommandOptionBuilder.from(option);
        MessageCommandOptionValidators.isValidMessageCommandOptionResolvable(option);
        this.options?.push(MessageCommandOptionBuilder.resolve(option));
        return this;
    }

    public setOptions(...options: RestOrArray<MessageCommandOptionResolvable|((builder: MessageCommandOptionBuilder) => MessageCommandOptionBuilder)>): this {
        options = normalizeArray(options);
        MessageCommandValidators.isValidOptions(options);
        this.options = options.map(o => MessageCommandOptionBuilder.resolve(o));
        return this;
    }

    public toJSON(): MessageCommandBuilderData {
        return {
            name: this.name,
            description: this.description,
            aliases: this.aliases,
            validate_options: this.validate_options,
            dm_permission: this.dm_permission,
            allow_bot: this.allow_bot,
            options: this.options,
            ...super._toJSON()
        };
    }

    public static from(data: MessageCommandResolvable): MessageCommandBuilder {
        return new MessageCommandBuilder(isJSONEncodable(data) ? data.toJSON() : data);
    }

    public static resolve(data: MessageCommandResolvable): MessageCommandBuilder {
        return data instanceof MessageCommandBuilder ? data : this.from(data);
    }

    public static async execute({ client, message, command }: MessageCommandExecuteOptions): Promise<MessageCommandExecuteData|null> {
        if (!message.content) return null;

        const parserData = getCommand(message.content, client.config.commands.messageCommand.prefix, client.config.commands.messageCommand.commandArgumentSeparator);
        if (!parserData || !parserData.name) return null;

        const builder = command ? this.resolve(command) : client.commands.get(parserData.name, CommandType.MessageCommand);
        if (!builder) return null;

        const executeData: MessageCommandExecuteData = {
            type: builder.command_type,
            client,
            message,
            builder,
            parserData,
            options: await MessageCommandOptionManager.parseOptions({
                client,
                command: builder,
                args: parserData.args,
                message
            })
        };

        if (client.config.commands.contextMenuCommands.enableCooldown !== false && builder.cooldown) {
            const cooldownData: Omit<CooldownData, 'endsAt'> = {
                commandType: builder.command_type,
                commandName: builder.name,
                userId: message.author.id,
                guildId: message.guild?.id
            };

            const cooldown = client.cooldowns.findCooldown(cooldownData);

            if (cooldown) {
                await client.executeCommandBuilderHalt({
                    reason: CommandHaltReason.Cooldown,
                    commandType: builder.command_type,
                    cooldown,
                    executeData
                });
                return null;
            }
        }

        const commandPreconditionTrigger = await client.commands.executePreconditions(executeData);
        if (commandPreconditionTrigger) {
            await client.executeCommandBuilderHalt({
                reason: CommandHaltReason.PreconditionTrigger,
                commandType: builder.command_type,
                ...commandPreconditionTrigger
            });
            return null;
        }

        if (builder.validate_options) {
            if (executeData.options.hasInvalidOptions) {
                await client.executeCommandBuilderHalt({
                    commandType: builder.command_type,
                    reason: CommandHaltReason.InvalidArguments,
                    executeData,
                    invalidOptions: executeData.options.getInvalidOptions()
                });
                return null;
            }

            if (executeData.options.hasMissingOptions) {
                await client.executeCommandBuilderHalt({
                    commandType: builder.command_type,
                    reason: CommandHaltReason.MissingArguments,
                    executeData,
                    missingOptions: executeData.options.getMissingOptions()
                });
                return null;
            }
        }

        return (await client.executeCommandBuilderExecute(executeData)) ? executeData : null;
    }
}

export interface MessageCommandExecuteOptions {
    client: RecipleClient<true>;
    message: Message;
    command?: MessageCommandResolvable;
}

export type MessageCommandResolvable = MessageCommandBuilderData|JSONEncodable<MessageCommandBuilderData>;
