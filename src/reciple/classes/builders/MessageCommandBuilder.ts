import { CommandBuilderType, CommandExecuteFunction, CommandHaltFunction } from '../../types/builders';
import { MessageCommandOptionManager } from '../MessageCommandOptionManager';
import { MessageCommandOptionBuilder } from './MessageCommandOptionBuilder';
import { Command as CommandMessage } from 'fallout-utility';
import { Message, PermissionResolvable } from 'discord.js';
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
 * Reciple builder for message command
 */
export class MessageCommandBuilder {
    public readonly builder = CommandBuilderType.MessageCommand;
    public name: string = '';
    public cooldown: number = 0;
    public description: string = '';
    public aliases: string[] = [];
    public options: MessageCommandOptionBuilder[] = [];
    public validateOptions: boolean = false;
    public requiredBotPermissions: PermissionResolvable[] = [];
    public requiredMemberPermissions: PermissionResolvable[] = [];
    public allowExecuteInDM: boolean = true;
    public allowExecuteByBots: boolean = false;
    public halt?: CommandHaltFunction<this>;
    public execute: CommandExecuteFunction<this> = () => { /* Execute */ };

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
     * Sets the execute cooldown for this command.
     * - `0` means no cooldown
     * @param cooldown Command cooldown in milliseconds
     */
    public setCooldown(cooldown: number): this {
        this.cooldown = cooldown;
        return this;
    }

    /**
     * Add aliases to the command
     * @param aliases Command aliases
     */
    public addAliases(...aliases: string[]): this {
        if (!aliases.length) throw new TypeError('Provide atleast one alias');
        if (aliases.some(a => !a || typeof a !== 'string' || !a.match(/^[\w-]{1,32}$/))) throw new TypeError('aliases must be strings and match the regex /^[\\w-]{1,32}$/');
        if (this.name && aliases.some(a => a == this.name)) throw new TypeError('alias cannot have same name to its real command name');
        
        this.aliases = [...new Set(aliases)];
        return this;
    }

    /**
     * Set required bot permissions to execute the command
     * @param permissions Bot's required permissions
     */
    public setRequiredBotPermissions(...permissions: PermissionResolvable[]): this {
        this.requiredBotPermissions = permissions;
        return this;
    }

    /**
     * Set required permissions to execute the command
     * @param permissions User's return permissions
     */
    public setRequiredMemberPermissions(...permissions: PermissionResolvable[]): this {
        this.requiredMemberPermissions = permissions;
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
     * Function when the command is interupted 
     * @param halt Function to execute when command is halted
     */
    public setHalt(halt?: CommandHaltFunction<this>): this {
        this.halt = halt ? halt : undefined;
        return this;
    }

    /**
     * Function when the command is executed 
     * @param execute Function to execute when the command is called 
     */
    public setExecute(execute: CommandExecuteFunction<this>): this {
        if (!execute || typeof execute !== 'function') throw new TypeError('execute must be a function.');
        this.execute = execute;
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
