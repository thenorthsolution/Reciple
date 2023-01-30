import { Awaitable, Message } from 'discord.js';
import { BaseCommandData } from '../../types/commands';

export type MessageCommandOptionResolvable = MessageCommandOptionData|MessageCommandOptionBuilder;

export interface MessageCommandOptionData extends BaseCommandData {
    required: boolean;
    validator?: MessageCommandOptionValidatorFunction;
}

export interface MessageCommandOptionValue {
    name: string;
    value?: string;
    missing: boolean;
    invalid: boolean;
    builder: MessageCommandOptionBuilder;
}

export type MessageCommandOptionValidatorFunction = (value: string, message: Message<boolean>) => Awaitable<boolean>;

export class MessageCommandOptionBuilder implements MessageCommandOptionData {
    public name: string = '';
    public description: string = '';
    public required: boolean = false;
    public validator?: MessageCommandOptionValidatorFunction;

    constructor(data?: Partial<MessageCommandOptionData>) {
        if (data?.name !== undefined) this.setName(data.name);
        if (data?.description !== undefined) this.setDescription(data.description);
        if (data?.required !== undefined) this.setRequired(data.required);
        if (data?.validator !== undefined) this.setValidator(data.validator);
    }

    public setName(name: string): this {
        this.name = name;
        return this;
    }

    public setDescription(description: string): this {
        this.description = description;
        return this;
    }

    public setRequired(required: boolean): this {
        this.required = required;
        return this;
    }

    public setValidator(validator: MessageCommandOptionValidatorFunction): this {
        this.validator = validator;
        return this;
    }

    public toJSON(): MessageCommandOptionData {
        return {
            name: this.name,
            description: this.description,
            required: this.required,
            validator: this.validator
        };
    }

    public static from(optionResolvable: MessageCommandOptionResolvable): MessageCommandOptionBuilder {
        return new MessageCommandOptionBuilder(optionResolvable instanceof MessageCommandOptionBuilder ? optionResolvable.toJSON() : optionResolvable); 
    }
}
