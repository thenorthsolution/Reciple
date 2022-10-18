import { CommandBuilderType, CommandHaltFunction, CommandExecuteFunction, SharedCommandBuilderProperties, MessageCommandData } from '../../types/builders';
import { Message, normalizeArray, PermissionResolvable, RestOrArray } from 'discord.js';
import { BaseCommandExecuteData, CommandHaltData } from '../../types/commands';
import { MessageCommandOptionManager } from '../managers/MessageCommandOptionManager';
import { MessageCommandOptionBuilder } from './MessageCommandOptionBuilder';
import { Command } from 'fallout-utility';

/**
 * Execute data for message command
 */
export interface MessageCommandExecuteData<T = unknown> extends BaseCommandExecuteData {
    /**
     * Command message
     */
    message: Message;
    /**
     * Command option args
     */
    options: MessageCommandOptionManager;
    /**
     * Command parsed args
     */
    command: Command;
    /**
     * Command builder
     */
    builder: MessageCommandBuilder<T>;
}

/**
 * Validated message command option
 */
export interface MessageCommandValidatedOption {
    /**
     * Option name
     */
    name: string;
    /**
     * Option value
     */
    value?: string;
    /**
     * Is the option required
     */
    required: boolean;
    /**
     * Is the option invalid
     */
    invalid: boolean;
    /**
     * Is the option missing
     */
    missing: boolean;
}

/**
 * Halt data for message command
 */
export type MessageCommandHaltData<T = unknown> = CommandHaltData<CommandBuilderType.MessageCommand, T>;

/**
 * Message command halt function
 */
export type MessageCommandHaltFunction<T = unknown> = CommandHaltFunction<CommandBuilderType.MessageCommand, T>;

/**
 * Message command execute function
 */
export type MessageCommandExecuteFunction<T = unknown> = CommandExecuteFunction<CommandBuilderType.MessageCommand, T>;

/**
 * Reciple builder for message command
 */
export class MessageCommandBuilder<T = unknown> implements SharedCommandBuilderProperties<T> {
    public readonly type = CommandBuilderType.MessageCommand;
    public name: string = '';
    public description: string = '';
    public cooldown: number = 0;
    public aliases: string[] = [];
    public validateOptions: boolean = false;
    public options: MessageCommandOptionBuilder[] = [];
    public requiredBotPermissions: PermissionResolvable[] = [];
    public requiredMemberPermissions: PermissionResolvable[] = [];
    public allowExecuteInDM: boolean = true;
    public allowExecuteByBots: boolean = false;
    public halt?: MessageCommandHaltFunction<T>;
    public execute: MessageCommandExecuteFunction<T> = () => { /* Execute */ };
    public metadata?: T;

    constructor(data?: Partial<Omit<MessageCommandData<T>, "type">>) {
        if (data?.name !== undefined) this.setName(data.name);
        if (data?.description !== undefined) this.setDescription(data.description);
        if (data?.aliases !== undefined) this.addAliases(data.aliases);
        if (data?.cooldown !== undefined) this.setCooldown(Number(data?.cooldown));
        if (data?.requiredBotPermissions !== undefined) this.setRequiredBotPermissions(data.requiredBotPermissions);
        if (data?.requiredMemberPermissions !== undefined) this.setRequiredMemberPermissions(data.requiredMemberPermissions);
        if (data?.halt !== undefined) this.setHalt(data.halt);
        if (data?.execute !== undefined) this.setExecute(data.execute);
        if (data?.metadata !== undefined) this.setMetadata(data.metadata);
        if (data?.allowExecuteByBots !== undefined) this.setAllowExecuteByBots(true);
        if (data?.allowExecuteInDM !== undefined) this.setAllowExecuteInDM(true);
        if (data?.validateOptions !== undefined) this.setValidateOptions(true);
        if (data?.options !== undefined) this.options = data.options.map(o => o instanceof MessageCommandOptionBuilder ? o : new MessageCommandOptionBuilder(o));
    }

    /**
     * Sets the command name
     * @param name Command name
     */
    public setName(name: string): this {
        if (!name || typeof name !== 'string' || !name.match(/^[\w-]{1,32}$/)) throw new TypeError('name must be a string and match the regex /^[\\w-]{1,32}$/');
        this.name = name;
        return this;
    }
    
    /**
     * Sets the command description
     * @param description Command description
     */
    public setDescription(description: string): this {
        if (!description || typeof description !== 'string') throw new TypeError('description must be a string.');
        this.description = description;
        return this;
    }

    /**
     * Add aliases to the command
     * @param aliases Command aliases
     */
    public addAliases(...aliases: RestOrArray<string>): this {
        aliases = normalizeArray(aliases);

        if (!aliases.length) throw new TypeError('Provide atleast one alias');
        if (aliases.some(a => !a || typeof a !== 'string' || a.match(/^\s+$/))) throw new TypeError('aliases must be strings and should not contain whitespaces');
        if (this.name && aliases.some(a => a == this.name)) throw new TypeError('alias cannot have same name to its real command name');

        this.aliases = [...new Set(aliases.map(s => s.toLowerCase()))];
        return this;
    }

    /**
     * Set if command can be executed in dms
     * @param allowExecuteInDM `true` if the command can execute in DMs
     */
    public setAllowExecuteInDM(allowExecuteInDM: boolean): this {
        if (typeof allowExecuteInDM !== 'boolean') throw new TypeError('allowExecuteInDM must be a boolean.');
        this.allowExecuteInDM = allowExecuteInDM;
        return this;
    }

    /**
     * Allow command to be executed by bots
     * @param allowExecuteByBots `true` if the command can be executed by bots
     */
    public setAllowExecuteByBots(allowExecuteByBots: boolean): this {
        if (typeof allowExecuteByBots !== 'boolean') throw new TypeError('allowExecuteByBots must be a boolean.');
        this.allowExecuteByBots = allowExecuteByBots;
        return this;
    }

    /**
     * Add option to the command
     * @param option Message option builder
     */
    public addOption(option: MessageCommandOptionBuilder|((constructor: MessageCommandOptionBuilder) => MessageCommandOptionBuilder)): this {
        if (!option) throw new TypeError('option must be a MessageOption.');

        option = typeof option === 'function' ? option(new MessageCommandOptionBuilder()) : option;

        if (this.options.find(o => o.name === option.name)) throw new TypeError('option with name "' + option.name + '" already exists.');
        if (this.options.length > 0 && !this.options[this.options.length - 1 < 0 ? 0 : this.options.length - 1].required && option.required) throw new TypeError('All required options must be before optional options.');

        this.options.push(option);
        return this;
    }

    /**
     * Validate options before executing
     * @param validateOptions `true` if the command options needs to be validated before executing
     */
    public setValidateOptions(validateOptions: boolean): this {
        if (typeof validateOptions !== 'boolean') throw new TypeError('validateOptions must be a boolean.');
        this.validateOptions = validateOptions;
        return this;
    }

    public setCooldown(cooldown: number): this {
        this.cooldown = cooldown;
        return this;
    }

    public setRequiredBotPermissions(...permissions: RestOrArray<PermissionResolvable>): this {
        this.requiredBotPermissions = normalizeArray(permissions);
        return this;
    }

    public setRequiredMemberPermissions(...permissions: RestOrArray<PermissionResolvable>): this {
        this.requiredMemberPermissions = normalizeArray(permissions);
        return this;
    }

    public setHalt(halt?: MessageCommandHaltFunction<T>|null): this {
        this.halt = halt ?? undefined;
        return this;
    }

    public setExecute(execute: MessageCommandExecuteFunction<T>): this {
        if (!execute || typeof execute !== 'function') throw new TypeError('execute must be a function.');
        this.execute = execute;
        return this;
    }

    public setMetadata(metadata?: T): this {
        this.metadata = metadata;
        return this;
    }

    /**
     * Returns JSON object of this builder
     */
    public toJSON(): MessageCommandData<T> {
        return {
            type: this.type,
            name: this.name,
            description: this.description,
            aliases: this.aliases,
            cooldown: this.cooldown,
            requiredBotPermissions: this.requiredBotPermissions,
            requiredMemberPermissions: this.requiredMemberPermissions,
            halt: this.halt,
            execute: this.execute,
            metadata: this.metadata,
            allowExecuteByBots: this.allowExecuteByBots,
            allowExecuteInDM: this.allowExecuteInDM,
            validateOptions: this.validateOptions,
            options: this.options.map(o => o.toJSON()),
        }
    }

    /**
     * Resolve message command data/builder
     * @param commandData Command data to resolve
     */
    public static resolveMessageCommand<T = unknown>(commandData: MessageCommandData<T>|MessageCommandBuilder<T>): MessageCommandBuilder<T> {
        return this.isMessageCommandBuilder<T>(commandData) ? commandData : new MessageCommandBuilder(commandData);
    }

    /**
     * Is a message command builder
     * @param builder data to check
     */
    public static isMessageCommandBuilder<T>(builder: unknown): builder is MessageCommandBuilder<T> {
        return builder instanceof MessageCommandBuilder;
    }

    /**
     * Is a message command execute data
     * @param executeData data to check
     */
    public static isMessageCommandExecuteData(executeData: unknown): executeData is MessageCommandExecuteData {
        return (executeData as MessageCommandExecuteData).builder !== undefined && this.isMessageCommandBuilder((executeData as MessageCommandExecuteData).builder);
    }
}

/**
 * Validate message command options
 * @param builder Command builder
 * @param options Parsed command args
 */
export async function validateMessageCommandOptions(builder: MessageCommandBuilder, options: Command): Promise<MessageCommandOptionManager> {
    const args = options.args || [];
    const required = builder.options.filter(o => o.required);
    const optional = builder.options.filter(o => !o.required);
    const allOptions = [...required, ...optional];
    const result: MessageCommandValidatedOption[] = [];

    let i = 0;
    for (const option of allOptions) {
        const arg = args[i];
        const value: MessageCommandValidatedOption = {
            name: option.name,
            value: arg ?? undefined,
            required: option.required,
            invalid: false,
            missing: false
        };

        if (arg == undefined && option.required) {
            value.missing = true;
            result.push(value);
            continue;
        }

        if (arg == undefined && !option.required) {
            result.push(value);
            continue;
        }

        const validate = option.validator ? await Promise.resolve(option.validator(arg)) : true;
        if (!validate) value.invalid = true;

        result.push(value);
        i++;
    }

    return new MessageCommandOptionManager(...result);
}
