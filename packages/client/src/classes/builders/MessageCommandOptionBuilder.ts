import { Awaitable, Message, isValidationEnabled } from 'discord.js';
import { MessageCommandOptionData } from '../../types/builders';
import { MessageCommandOptionValueData } from '../managers/MessageCommandOptionManager';

export type MessageCommandOptionResolvable = MessageCommandOptionBuilder|MessageCommandOptionData;

export class MessageCommandOptionBuilder {
    public name!: string;
    public description!: string;
    public required: boolean = false;
    public validator?: (value: string, message: Message) => Awaitable<boolean>;

    constructor(data?: MessageCommandOptionData) {}

    public setName(name: string): this {
        if (isValidationEnabled() && (typeof name !== 'string' || !name.match(/^[\w-]{1,32}$/))) throw new TypeError('name must be a string and match the regex /^[\\w-]{1,32}$/.');
        this.name = name;
        return this;
    }

    public setDescription(description: string): this {
        if (isValidationEnabled() && (!description || typeof description !== 'string')) throw new TypeError('description must be a string.');
        this.description = description;
        return this;
    }

    public setRequired(required: boolean): this {
        this.required = !!required;
        return this;
    }

    public setValidator(validator?: (value: string) => Awaitable<boolean>): this {
        if (isValidationEnabled() && validator !== undefined && typeof validator !== 'function') throw new TypeError('validator must be a function.');
        this.validator = validator;
        return this;
    }

    public toJSON(): MessageCommandOptionData {
        return {
            name: this.name,
            description: this.description,
            required: this.required,
            validator: this.validator,
        };
    }

    public static from(option: MessageCommandOptionResolvable): MessageCommandOptionBuilder {
        return this.isMessageCommandOption(option) ? option : new MessageCommandOptionBuilder(option);
    }

    public static isMessageCommandOption(builder: unknown): builder is MessageCommandOptionBuilder {
        return builder instanceof MessageCommandOptionBuilder;
    }

    public static async validateOptionValue(option: MessageCommandOptionResolvable, message: Message, value?: string): Promise<MessageCommandOptionValueData> {
        const validatedOption: MessageCommandOptionValueData = {
            name: option.name,
            value,
            required: !!option.required,
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
