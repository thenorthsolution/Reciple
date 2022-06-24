import { MessageCommandOptionBuilder } from './MessageCommandOptionBuilder';
import { Message, PermissionFlags, PermissionString } from 'discord.js';
import { Command } from 'fallout-utility';
import { RecipleClient } from '../Client';


export type CommandMessage = Command;

export interface RecipleMessageCommandExecute {
    message: Message;
    command: CommandMessage;
    builder: MessageCommandBuilder;
    client: RecipleClient;
}

export interface MessageCommandValidatedOption {
    name: string;
    value: string;
    required: boolean;
}

export class MessageCommandBuilder {
    public readonly builder: string = 'MESSAGE_COMMAND';
    public name: string = '';
    public description: string = '';
    public options: MessageCommandOptionBuilder[] = [];
    public validateOptions: boolean = false;
    public requiredPermissions: (PermissionFlags|PermissionString)[] = [];
    public allowExecuteInDM: boolean = true;
    public allowExecuteByBots: boolean = false;
    public execute: (options: RecipleMessageCommandExecute) => void = () => { /* Execute */ };

    public setName(name: string): MessageCommandBuilder {
        if (!name || typeof name !== 'string' || !name.match(/^[\w-]{1,32}$/)) throw new TypeError('name must be a string and match the regex /^[\\w-]{1,32}$/');
        this.name = name;
        return this;
    }

    public setRequiredPermissions(permissions: (PermissionFlags|PermissionString)[]): MessageCommandBuilder {
        if (!permissions || !Array.isArray(permissions)) throw new TypeError('permissions must be an array.');
        this.requiredPermissions = permissions;
        return this;
    }

    public setAllowExecuteInDM(allowExecuteInDM: boolean): MessageCommandBuilder {
        if (typeof allowExecuteInDM !== 'boolean') throw new TypeError('allowExecuteInDM must be a boolean.');
        this.allowExecuteInDM = allowExecuteInDM;
        return this;
    }

    public setAllowExecuteByBots(allowExecuteByBots: boolean): MessageCommandBuilder {
        if (typeof allowExecuteByBots !== 'boolean') throw new TypeError('allowExecuteByBots must be a boolean.');
        this.allowExecuteByBots = allowExecuteByBots;
        return this;
    }

    public setDescription(description: string): MessageCommandBuilder {
        if (!description || typeof description !== 'string') throw new TypeError('description must be a string.');
        this.description = description;
        return this;
    }

    public setExecute(execute: (options: RecipleMessageCommandExecute) => void): MessageCommandBuilder {
        if (!execute || typeof execute !== 'function') throw new TypeError('execute must be a function.');
        this.execute = execute;
        return this;
    }

    public addOption(option: MessageCommandOptionBuilder|((constructor: MessageCommandOptionBuilder) => MessageCommandOptionBuilder)): MessageCommandBuilder {
        if (!option) throw new TypeError('option must be a MessageOption.');

        option = typeof option === 'function' ? option(new MessageCommandOptionBuilder()) : option;

        if (this.options.find(o => o.name === option.name)) throw new TypeError('option with name "' + option.name + '" already exists.');
        if (this.options.length > 0 && !this.options[this.options.length - 1 < 0 ? 0 : this.options.length - 1].required && option.required) throw new TypeError('All required options must be before optional options.');

        this.options = [...this.options, option];
        return this;
    }

    public setValidateOptions(validateOptions: boolean): MessageCommandBuilder {
        if (typeof validateOptions !== 'boolean') throw new TypeError('validateOptions must be a boolean.');
        this.validateOptions = validateOptions;
        return this;
    }

    public getCommandOptionValues(options: CommandMessage): undefined|MessageCommandValidatedOption[] {
        const args = options.args || [];
        const required = this.options.filter(o => o.required);
        const optional = this.options.filter(o => !o.required);

        if (required.length > args.length) return;
        
        let i = 0;
        let result: MessageCommandValidatedOption[] = [];
        for (const option of [...required, ...optional]) {
            const arg = args[i];
            if (!arg && option.required) return;
            if (typeof arg !== 'undefined' && !option.validate(arg)) return;

            result = [...result, { name: option.name, value: arg, required: option.required }];

            i++;
        }

        return result;
    }
}
