import { MessageCommandOptionBuilder } from './MessageCommandOptionBuilder';
import { CommandHaltFunction, RecipleClient } from '../RecipleClient';
import { MessageCommandOptions } from '../MessageCommandOptions';
import { Message, PermissionResolvable } from 'discord.js';
import { Command as CommandMessage } from 'fallout-utility';


export interface RecipleMessageCommandExecute {
    message: Message;
    options: MessageCommandOptions;
    command: CommandMessage;
    builder: MessageCommandBuilder;
    client: RecipleClient<true>;
}

export interface MessageCommandValidatedOption {
    name: string;
    value: string|undefined;
    required: boolean;
    invalid: boolean;
    missing: boolean;
}

export class MessageCommandBuilder {
    public readonly builder = 'MESSAGE_COMMAND';
    public name: string = '';
    public cooldown: number = 0;
    public description: string = '';
    public aliases: string[] = [];
    public options: MessageCommandOptionBuilder[] = [];
    public validateOptions: boolean = false;
    public requiredBotPermissions: PermissionResolvable[] = [];
    public RequiredUserPermissions: PermissionResolvable[] = [];
    public allowExecuteInDM: boolean = true;
    public allowExecuteByBots: boolean = false;
    public halt?: CommandHaltFunction<RecipleMessageCommandExecute>;
    public execute: (options: RecipleMessageCommandExecute) => void = () => { /* Execute */ };

    /**
     * Sets the command name
     */
    public setName(name: string): MessageCommandBuilder {
        if (!name || typeof name !== 'string' || !name.match(/^[\w-]{1,32}$/)) throw new TypeError('name must be a string and match the regex /^[\\w-]{1,32}$/');
        this.name = name;
        return this;
    }
    
    /**
     * Sets the command description
     */
    public setDescription(description: string): MessageCommandBuilder {
        if (!description || typeof description !== 'string') throw new TypeError('description must be a string.');
        this.description = description;
        return this;
    }

    /**
     * Sets the execute cooldown for this command.
     * - `0` means no cooldown
     */
    public setCooldown(cooldown: number): MessageCommandBuilder {
        this.cooldown = cooldown;
        return this;
    }

    /**
     * Add aliases to the command
     */
    public addAliases(...aliases: string[]): MessageCommandBuilder {
        if (!aliases.length) throw new TypeError('Provide atleast one alias');
        if (aliases.some(a => !a || typeof a !== 'string' || !a.match(/^[\w-]{1,32}$/))) throw new TypeError('aliases must be strings and match the regex /^[\\w-]{1,32}$/');
        if (this.name && aliases.some(a => a == this.name)) throw new TypeError('alias cannot have same name to its real command name');
        
        this.aliases = [...new Set(aliases)];
        return this;
    }

    /**
     * Set required per
     */
    public setRequiredBotPermissions(...permissions: PermissionResolvable[]): MessageCommandBuilder {
        this.requiredBotPermissions = permissions;
        return this;
    }

    /**
     * Set required user permissions to execute the command
     */
    public setRequiredMemberPermissions(...permissions: PermissionResolvable[]): MessageCommandBuilder {
        this.RequiredUserPermissions = permissions;
        return this;
    }

    /**
     * Set if command can be executed in dms
     */
    public setAllowExecuteInDM(allowExecuteInDM: boolean): MessageCommandBuilder {
        if (typeof allowExecuteInDM !== 'boolean') throw new TypeError('allowExecuteInDM must be a boolean.');
        this.allowExecuteInDM = allowExecuteInDM;
        return this;
    }

    /**
     * Allow command to be executed by bots
     */
    public setAllowExecuteByBots(allowExecuteByBots: boolean): MessageCommandBuilder {
        if (typeof allowExecuteByBots !== 'boolean') throw new TypeError('allowExecuteByBots must be a boolean.');
        this.allowExecuteByBots = allowExecuteByBots;
        return this;
    }

    /**
     * Function when the command is interupted before execution 
     */
    public setHalt(halt?: CommandHaltFunction<RecipleMessageCommandExecute>): MessageCommandBuilder {
        this.halt = halt ? halt : undefined;
        return this;
    }

    /**
     * Function when the command is executed
     */
    public setExecute(execute: (options: RecipleMessageCommandExecute) => void): MessageCommandBuilder {
        if (!execute || typeof execute !== 'function') throw new TypeError('execute must be a function.');
        this.execute = execute;
        return this;
    }

    /**
     * Add option to the command
     */
    public addOption(option: MessageCommandOptionBuilder|((constructor: MessageCommandOptionBuilder) => MessageCommandOptionBuilder)): MessageCommandBuilder {
        if (!option) throw new TypeError('option must be a MessageOption.');

        option = typeof option === 'function' ? option(new MessageCommandOptionBuilder()) : option;

        if (this.options.find(o => o.name === option.name)) throw new TypeError('option with name "' + option.name + '" already exists.');
        if (this.options.length > 0 && !this.options[this.options.length - 1 < 0 ? 0 : this.options.length - 1].required && option.required) throw new TypeError('All required options must be before optional options.');

        this.options = [...this.options, option];
        return this;
    }

    /**
     * Validate options before executing 
     */
    public setValidateOptions(validateOptions: boolean): MessageCommandBuilder {
        if (typeof validateOptions !== 'boolean') throw new TypeError('validateOptions must be a boolean.');
        this.validateOptions = validateOptions;
        return this;
    }

    /**
     * validate given command options 
     */
    public getCommandOptionValues(options: CommandMessage): MessageCommandValidatedOption[] {
        const args = options.args || [];
        const required = this.options.filter(o => o.required);
        const optional = this.options.filter(o => !o.required);
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

            const validate = option.validator ? option.validator(arg) : true;
            if (!validate) value.invalid = true;

            result.push(value);
            i++;
        }

        return result;
    }
}
