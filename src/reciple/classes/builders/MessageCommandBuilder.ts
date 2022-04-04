import { Message } from 'discord.js';
import { RecipleClient } from '../Client';


export interface CommandMessage {
    command?: string;
    args?: string[];
    raw?: string;
    prefix?: string;
    separator?: string;
}

export interface RecipleMessageCommandExecute {
    message: Message;
    command: CommandMessage;
    builder: MessageCommandBuilder;
    client: RecipleClient;
}

export interface MessageCommandValidatedOption {
    name: string;
    value: any;
    required: boolean;
}

export class MessageOption {
    public name: string = '';
    public description: string = '';
    public required: boolean = true;
    public validate: (value: any) => boolean = () => true;

    public setName(name: string): MessageOption {
        if (typeof name !== 'string' || !name.match(/^[\w-]{1,32}$/)) throw new Error('name must be a string and match the regex /^[\\w-]{1,32}$/.');
        this.name = name;
        return this;
    }

    public setDescription(description: string): MessageOption {
        if (!description || typeof description !== 'string') throw new Error('description must be a string.');
        this.description = description;
        return this;
    }

    public setRequired(required: boolean): MessageOption {
        if (typeof required !== 'boolean') throw new Error('required must be a boolean.');
        this.required = required;
        return this;
    }

    public setValidator(validator: (value: any) => boolean): MessageOption {
        if (!validator || typeof validator !== 'function') throw new Error('validator must be a function.');
        this.validate = validator;
        return this;
    }
}

export class MessageCommandBuilder {
    public allowExecuteInDM: boolean = true;
    public name: string = '';
    public description: string = '';
    public options: MessageOption[] = [];
    public validateOptions: boolean = false;
    public execute: (options: RecipleMessageCommandExecute) => void = (options) => { /* Execute */ };

    public setName(name: string): MessageCommandBuilder {
        if (!name || typeof name !== 'string' || !name.match(/^[\w-]{1,32}$/)) throw new Error('name must be a string and match the regex /^[\\w-]{1,32}$/');
        this.name = name;
        return this;
    }

    public setAllowExecuteInDM(allowExecuteInDM: boolean): MessageCommandBuilder {
        if (typeof allowExecuteInDM !== 'boolean') throw new Error('allowExecuteInDM must be a boolean.');
        this.allowExecuteInDM = allowExecuteInDM;
        return this;
    }

    public setDescription(description: string): MessageCommandBuilder {
        if (!description || typeof description !== 'string') throw new Error('description must be a string.');
        this.description = description;
        return this;
    }

    public setExecute(execute: (options: RecipleMessageCommandExecute) => void): MessageCommandBuilder {
        if (!execute || typeof execute !== 'function') throw new Error('execute must be a function.');
        this.execute = execute;
        return this;
    }

    public addOption(option: MessageOption|(() => MessageOption)): MessageCommandBuilder {
        if (!option) throw new Error('option must be a MessageOption.');
        if (this.options.find(o => o.name === (typeof option === 'function' ? option().name : option.name))) throw new Error('option with name "' + option.name + '" already exists.');
        
        this.options = [...this.options, typeof option === 'function' ? option() : option];
        return this;
    }

    public setValidateOptions(validateOptions: boolean): MessageCommandBuilder {
        if (typeof validateOptions !== 'boolean') throw new Error('validateOptions must be a boolean.');
        this.validateOptions = validateOptions;
        return this;
    }

    public validateCommandOptions(options: CommandMessage): boolean|MessageCommandValidatedOption[] {
        const args = options.args || [];
        const required = this.options.filter(o => o.required);
        const optional = this.options.filter(o => !o.required);

        if (required.length > args.length) return false;
        
        let i = 0;
        let result: MessageCommandValidatedOption[] = [];
        for (const option of [...required, ...optional]) {
            const arg = args[i];
            if (!arg && option.required) return false;
            if (!option.validate(arg)) return false;

            result = [...result, { name: option.name, value: arg, required: option.required }];

            i++;
        }

        return result;
    }
}