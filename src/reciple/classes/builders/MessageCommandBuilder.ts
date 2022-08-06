import { CommandBuilderType, AnyCommandExecuteData, CommandHaltFunction, CommandExecuteFunction, SharedCommandBuilderProperties } from '../../types/builders';
import { Message, normalizeArray, PermissionResolvable, RestOrArray } from 'discord.js';
import { MessageCommandOptionManager } from '../MessageCommandOptionManager';
import { MessageCommandOptionBuilder } from './MessageCommandOptionBuilder';
import { Command as CommandMessage } from 'fallout-utility';
import { CommandHaltData } from '../../types/commands';
import { RecipleClient } from '../RecipleClient';

/**
 * Execute data for message command
 */
export interface MessageCommandExecuteData {
    message: Message;
    options: MessageCommandOptionManager;
    command: CommandMessage;
    builder: MessageCommandBuilder;
    client: RecipleClient<true>;
}

/**
 * Validated message command option
 */
export interface MessageCommandValidatedOption {
    name: string;
    value: string|undefined;
    required: boolean;
    invalid: boolean;
    missing: boolean;
}

/**
 * Halt data for message command
 */
export type MessageCommandHaltData = CommandHaltData<CommandBuilderType.MessageCommand>;

/**
 * Message command halt function
 */
export type MessageCommandHaltFunction = CommandHaltFunction<CommandBuilderType.MessageCommand>;

/**
 * Message command execute function
 */
export type MessageCommandExecuteFunction = CommandExecuteFunction<CommandBuilderType.MessageCommand>;

/**
 * Reciple builder for message command
 */
export class MessageCommandBuilder implements SharedCommandBuilderProperties {
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
    public halt?: MessageCommandHaltFunction;
    public execute: MessageCommandExecuteFunction = () => { /* Execute */ };

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
        if (aliases.some(a => !a || typeof a !== 'string' || !a.match(/^[\w-]{1,32}$/))) throw new TypeError('aliases must be strings and match the regex /^[\\w-]{1,32}$/');
        if (this.name && aliases.some(a => a == this.name)) throw new TypeError('alias cannot have same name to its real command name');
        
        this.aliases = [...new Set(aliases)];
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

        this.options = [...this.options, option];
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

    public setHalt(halt?: this["halt"]): this {
        this.halt = halt ? halt : undefined;
        return this;
    }

    public setExecute(execute: this["execute"]): this {
        if (!execute || typeof execute !== 'function') throw new TypeError('execute must be a function.');
        this.execute = execute;
        return this;
    }

    /**
     * Is a message command builder 
     */
    public static isMessageCommandBuilder(builder: any): builder is MessageCommandBuilder {
        return builder instanceof MessageCommandBuilder;
    }

    /**
     * Is a message command execute data
     */
    public static isMessageCommandExecuteData(executeData: AnyCommandExecuteData): executeData is MessageCommandExecuteData {
        return (executeData as MessageCommandExecuteData).builder !== undefined && this.isMessageCommandBuilder((executeData as MessageCommandExecuteData).builder);
    }
}

export async function validateMessageCommandOptions(builder: MessageCommandBuilder, options: CommandMessage): Promise<MessageCommandOptionManager> {
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
