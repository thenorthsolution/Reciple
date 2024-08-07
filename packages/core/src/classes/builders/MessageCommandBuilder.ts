import { isJSONEncodable, type Awaitable, type JSONEncodable, type RestOrArray, type Message, normalizeArray } from 'discord.js';
import { MessageCommandOptionBuilder, type MessageCommandOptionResolvable } from './MessageCommandOptionBuilder.js';
import { MessageCommandFlagBuilder, type MessageCommandFlagResolvable } from './MessageCommandFlagBuilder.js';
import type { CommandHalt, CommandHaltData, CommandHaltResolvable } from '../structures/CommandHalt.js';
import { MessageCommandOptionValidators } from '../validators/MessageCommandOptionValidators.js';
import { MessageCommandFlagValidators } from '../validators/MessageCommandFlagValidators.js';
import { BaseCommandBuilder, type BaseCommandBuilderData } from './BaseCommandBuilder.js';
import { MessageCommandOptionManager } from '../managers/MessageCommandOptionManager.js';
import { MessageCommandValidators } from '../validators/MessageCommandValidators.js';
import type { CommandData, CommandHaltTriggerData } from '../../types/structures.js';
import { MessageCommandFlagManager } from '../managers/MessageCommandFlagManager.js';
import { CommandHaltReason, CommandType } from '../../types/constants.js';
import type { RecipleClient } from '../structures/RecipleClient.js';
import type { CooldownData } from '../structures/Cooldown.js';
import { RecipleError } from '../structures/RecipleError.js';
import { getCommand } from 'fallout-utility/commands';
import { parseArgs } from 'node:util';

export interface MessageCommandExecuteData {
    type: CommandType.MessageCommand;
    client: RecipleClient<true>;
    message: Message<boolean>;
    parserData: CommandData;
    options: MessageCommandOptionManager;
    flags: MessageCommandFlagManager;
    builder: MessageCommandBuilder;
}

export type MessageCommandHaltTriggerData = CommandHaltTriggerData<CommandType.MessageCommand>;

export type MessageCommandExecuteFunction = (executeData: MessageCommandExecuteData) => Awaitable<void>;
export type MessageCommandHaltFunction = CommandHaltData['messageCommandHalt'];

export interface MessageCommandBuilderData extends BaseCommandBuilderData {
    command_type: CommandType.MessageCommand;
    halts?: CommandHaltResolvable[];
    execute: MessageCommandExecuteFunction;
    /**
     * The name of the command.
     */
    name: string;
    /**
     * The description of the command.
     */
    description: string;
    /**
     * The aliases of the command.
     */
    aliases?: string[];
    /**
     * Whether to validate options or not.
     * @default true
     */
    validate_options?: boolean;
    /**
     * Whether to validate flags or not.
     * @default true
     */
    validate_flags?: boolean;
    /**
     * Allows commands to be executed in DMs.
     * @default false
     */
    dm_permission?: boolean;
    /**
     * Allow bots to execute this command.
     * @default false
     */
    allow_bot?: boolean;
    /**
     * The options of the command.
     */
    options?: MessageCommandOptionResolvable[];
    /**
     * The flags of the command.
     */
    flags?: MessageCommandFlagResolvable[];
}

export interface MessageCommandBuilder extends BaseCommandBuilder {
    halts: CommandHalt[];
    execute: MessageCommandExecuteFunction;

    setHalts(...halts: RestOrArray<CommandHaltResolvable>): this;
    setExecute(execute: MessageCommandExecuteFunction): this;
}

export class MessageCommandBuilder extends BaseCommandBuilder implements MessageCommandBuilder, MessageCommandBuilderData {
    public readonly command_type: CommandType.MessageCommand = CommandType.MessageCommand;
    public name: string = '';
    public description: string = '';
    public aliases: string[] = [];
    public validate_options: boolean = true;
    public validate_flags: boolean = true;
    public dm_permission: boolean = false;
    public allow_bot: boolean = false;
    public options: MessageCommandOptionBuilder[] = [];
    public flags: MessageCommandFlagBuilder[] = [];

    constructor(data?: Omit<Partial<MessageCommandBuilderData>, 'command_type'>) {
        super(data);

        if (data?.name) this.setName(data.name);
        if (data?.description) this.setDescription(data.description);
        if (data?.aliases) this.setAliases(data.aliases);
        if (data?.validate_options) this.setValidateOptions(data.validate_options);
        if (data?.validate_flags) this.setValidateFlags(data.validate_flags);
        if (data?.dm_permission) this.setDMPermission(data.dm_permission);
        if (data?.allow_bot) this.setAllowBot(data.allow_bot);
        if (data?.options) this.setOptions(data.options);
        if (data?.flags) this.setFlags(data.flags);
    }

    /**
     * Sets the name of the command.
     * @param name Name of the command.
     */
    public setName(name: string): this {
        MessageCommandValidators.isValidName(name);
        this.name = name;
        return this;
    }

    /**
     * Sets the description of the command.
     * @param description Description of the command.
     */
    public setDescription(description: string): this {
        MessageCommandValidators.isValidDescription(description);
        this.description = description;
        return this;
    }

    /**
     * Adds aliases to the command.
     * @param aliases Aliases of the command.
     */
    public addAliases(...aliases: RestOrArray<string>): this {
        aliases = normalizeArray(aliases);
        MessageCommandValidators.isValidAliases(aliases);
        this.aliases?.push(...aliases);
        return this;
    }

    /**
     * Sets aliases to the command.
     * @param aliases Aliases of the command.
     */
    public setAliases(...aliases: RestOrArray<string>): this {
        aliases = normalizeArray(aliases);
        MessageCommandValidators.isValidAliases(aliases);
        this.aliases = aliases;
        return this;
    }

    /**
     * Set whether to validate options or not.
     * @param enabled Enable option validation.
     */
    public setValidateOptions(enabled: boolean): this {
        MessageCommandValidators.isValidValidateOptions(enabled);
        this.validate_options = enabled;
        return this;
    }

    /**
     * Set whether to validate flags or not.
     * @param enabled Enable flag validation.
     */
    public setValidateFlags(enabled: boolean): this {
        MessageCommandValidators.isValidValidateFlags(enabled);
        this.validate_flags = enabled;
        return this;
    }

    /**
     * Sets whether the command is available in DMs or not.
     * @param DMPermission Enable command in Dms.
     */
    public setDMPermission(DMPermission: boolean): this {
        MessageCommandValidators.isValidDMPermission(DMPermission);
        this.dm_permission = DMPermission;
        return this;
    }

    /**
     * Sets whether bots can use the command or not.
     * @param enabled Enable bot usage of the command.
     */
    public setAllowBot(enabled: boolean): this {
        MessageCommandValidators.isValidAllowBot(enabled);
        this.allow_bot = enabled;
        return this;
    }

    /**
     * Adds new option to the command.
     * @param option Option data or builder.
     */
    public addOption(option: MessageCommandOptionResolvable|((builder: MessageCommandOptionBuilder) => MessageCommandOptionBuilder)): this {
        const opt = typeof option === 'function' ? option(new MessageCommandOptionBuilder()) : MessageCommandOptionBuilder.resolve(option);
        MessageCommandOptionValidators.isValidMessageCommandOptionResolvable(opt);

        if (this.options.find(o => o.name === opt.name)) throw new RecipleError('An option with name "' + opt.name + '" already exists.');
        if (this.options.length > 0 && this.options.some(o => !o.required) && opt.required) throw new RecipleError('All required options must be before optional options.');

        this.options.push(MessageCommandOptionBuilder.resolve(opt));
        return this;
    }

    /**
     * Sets the options of the command.
     * @param options Options data or builders.
     */
    public setOptions(...options: RestOrArray<MessageCommandOptionResolvable|((builder: MessageCommandOptionBuilder) => MessageCommandOptionBuilder)>): this {
        options = normalizeArray(options);
        MessageCommandValidators.isValidOptions(options);
        this.options = [];

        for (const option of options) {
            this.addOption(option);
        }

        return this;
    }

    /**
     * Adds new flag to the command.
     * @param option Flag data or builder.
     */
    public addFlag(option: MessageCommandFlagResolvable|((builder: MessageCommandFlagBuilder) => MessageCommandFlagBuilder)): this {
        const opt = typeof option === 'function' ? option(new MessageCommandFlagBuilder()) : MessageCommandFlagBuilder.resolve(option);
        MessageCommandFlagValidators.isValidMessageCommandFlagResolvable(opt);

        if (this.flags.find(o => o.name === opt.name)) throw new RecipleError('A flag with name "' + opt.name + '" already exists.');

        this.flags.push(MessageCommandFlagBuilder.resolve(opt));
        return this;
    }

    /**
     * Sets the flags of the command.
     * @param flags Flags data or builders.
     */
    public setFlags(...flags: RestOrArray<MessageCommandFlagResolvable|((builder: MessageCommandFlagBuilder) => MessageCommandFlagBuilder)>): this {
        flags = normalizeArray(flags);
        MessageCommandValidators.isValidFlags(flags);
        this.flags = [];

        for (const flag of flags) {
            this.addFlag(flag);
        }

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
            options: this.options.map(b => b.toJSON()),
            flags: this.flags.map(b => b.toJSON()),
            ...super._toJSON<CommandType.MessageCommand, MessageCommandExecuteFunction>()
        };
    }

    public static from(data: MessageCommandResolvable): MessageCommandBuilder {
        return new MessageCommandBuilder(isJSONEncodable(data) ? data.toJSON() : data);
    }

    public static resolve(data: MessageCommandResolvable): MessageCommandBuilder {
        return data instanceof MessageCommandBuilder ? data : MessageCommandBuilder.from(data);
    }

    public static async execute({ client, message, command }: MessageCommandExecuteOptions): Promise<MessageCommandExecuteData|null> {
        if (!message.content) return null;

        const prefix = typeof client.config.commands?.messageCommand?.prefix === 'function' ? await Promise.resolve(client.config.commands.messageCommand.prefix({ client, message, guild: message.guild, command })) : client.config.commands?.messageCommand?.prefix;
        const separator = typeof client.config.commands?.messageCommand?.commandArgumentSeparator === 'function' ? await Promise.resolve(client.config.commands.messageCommand.commandArgumentSeparator({ client, message, guild: message.guild, command })) : client.config.commands?.messageCommand?.commandArgumentSeparator;
        const commandData = getCommand(message.content, prefix, separator);
        if (!commandData || !commandData.name) return null;

        const builder = command ? this.resolve(command) : client.commands.get(commandData.name, CommandType.MessageCommand);
        if (!builder) return null;

        const { positionals: args, values: flags } = parseArgs({
            args: commandData.args,
            allowPositionals: true,
            strict: false,
            options: Object.fromEntries(
                builder.flags
                    .map((o) => [
                        o.name,
                        Object.fromEntries(
                            Object.entries({
                                type: o.value_type ?? 'string',
                                multiple: o.multiple,
                                short: o.shortcut,
                                default: o.multiple ? o.default_values : o.default_values?.[0],
                            })
                            .filter(([key, value]) => value !== undefined)
                        ) as any
                    ])
            ),
        });

        const parserData = {
            ...commandData as CommandData & { name: string; },
            args,
            flags: Object
                .entries(flags)
                .filter(([key, value]) => value !== undefined)
                .map(([key, value]) => ({
                    name: key,
                    value: Array.isArray(value) ? value : [value] as (string|boolean)[],
                }))
        };

        const executeData: MessageCommandExecuteData = {
            type: builder.command_type,
            client,
            message,
            builder,
            parserData,
            options: await MessageCommandOptionManager.parseOptions({
                command: builder,
                message,
                parserData,
                client
            }),
            flags: await MessageCommandFlagManager.parseFlags({
                command: builder,
                message,
                parserData,
                client
            })
        };

        if (client.config.commands?.messageCommand?.enableCooldown !== false && builder.cooldown) {
            const cooldownData: Omit<CooldownData, 'endsAt'> = {
                commandType: builder.command_type,
                commandName: builder.name,
                userId: message.author.id,
                guildId: message.guild?.id
            };

            const cooldown = client.cooldowns.findCooldown(cooldownData);

            if (cooldown) {
                await client.commands.executeHalts({
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
            await client.commands.executeHalts({
                reason: CommandHaltReason.PreconditionTrigger,
                commandType: builder.command_type,
                ...commandPreconditionTrigger
            });
            return null;
        }

        if (builder.validate_options) {
            if (executeData.options.hasInvalidOptions) {
                await client.commands.executeHalts({
                    commandType: builder.command_type,
                    reason: CommandHaltReason.InvalidArguments,
                    executeData,
                    invalidOptions: executeData.options.invalidOptions
                });
                return null;
            }

            if (executeData.options.hasMissingOptions) {
                await client.commands.executeHalts({
                    commandType: builder.command_type,
                    reason: CommandHaltReason.MissingArguments,
                    executeData,
                    missingOptions: executeData.options.missingOptions
                });
                return null;
            }
        }

        if (builder.validate_flags) {
            if (executeData.flags.hasInvalidFlags) {
                await client.commands.executeHalts({
                    commandType: builder.command_type,
                    reason: CommandHaltReason.InvalidFlags,
                    executeData,
                    invalidFlags: executeData.flags.invalidFlags
                });
                return null;
            }

            if (executeData.flags.hasMissingFlags) {
                await client.commands.executeHalts({
                    commandType: builder.command_type,
                    reason: CommandHaltReason.MissingFlags,
                    executeData,
                    missingFlags: executeData.flags.missingFlags
                });
                return null;
            }
        }

        return (await client.commands.executeCommandBuilderExecute(executeData)) ? executeData : null;
    }
}

export interface MessageCommandExecuteOptions {
    client: RecipleClient<true>;
    message: Message;
    command?: MessageCommandResolvable;
}

export type MessageCommandResolvable = MessageCommandBuilderData|JSONEncodable<MessageCommandBuilderData>;
