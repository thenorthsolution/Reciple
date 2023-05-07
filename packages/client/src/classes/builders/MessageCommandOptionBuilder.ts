import { BaseCommandData } from '../../types/commands';
import { Awaitable, Message } from 'discord.js';

export type MessageCommandOptionResolvable = MessageCommandOptionData|MessageCommandOptionBuilder;

export interface MessageCommandOptionData extends BaseCommandData {
    /**
     * Makes the option required
     */
    required: boolean;
    /**
     * Option validator function
     */
    validator?: MessageCommandOptionValidatorFunction;
}

export interface MessageCommandOptionValue {
    /**
     * Option name
     */
    name: string;
    /**
     * Option value
     */
    value?: string;
    /**
     * Option is missing
     */
    missing: boolean;
    /**
     * Option is invalid
     */
    invalid: boolean;
    /**
     * Command option builder
     */
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

    public static resolve(optionResolvable: MessageCommandOptionResolvable): MessageCommandOptionBuilder {
        return optionResolvable instanceof MessageCommandOptionBuilder ? optionResolvable : new MessageCommandOptionBuilder(optionResolvable); 
    }

    public static async validateOptionValue(option: MessageCommandOptionResolvable, message: Message, value?: string): Promise<MessageCommandOptionValue> {
        const validatedOption: MessageCommandOptionValue = {
            name: option.name,
            builder: MessageCommandOptionBuilder.resolve(option),
            value,
            invalid: false,
            missing: false,
        };

        if (value == undefined && option.required) {
            validatedOption.missing = true;
            return validatedOption;
        }

        if (value == undefined && !option.required) return validatedOption;

        const validate = option.validator !== undefined ? await Promise.resolve(option.validator(value ?? '', message)) : true;
        if (!validate) validatedOption.invalid = true;

        return validatedOption;
    }
}
