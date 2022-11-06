import { MessageCommandOptionData, MessageCommandOptionResolvable } from '../../types/builders';
import { Awaitable, isValidationEnabled } from 'discord.js';
import { MessageCommandValidatedOption } from './MessageCommandBuilder';

/**
 * Option builder for MessageCommandBuilder
 */
export class MessageCommandOptionBuilder {
    protected _name: string = '';
    protected _description: string = '';
    protected _required: boolean = false;
    protected _validator?: (value: string) => Awaitable<boolean>;

    get name(): typeof this._name {
        return this._name;
    }
    get description(): typeof this._description {
        return this._description;
    }
    get required(): typeof this._required {
        return this._required;
    }
    get validator(): typeof this._validator {
        return this._validator;
    }

    set name(name: typeof this._name) {
        this.setName(name);
    }
    set description(description: typeof this._description) {
        this.setDescription(description);
    }
    set required(required: typeof this._required) {
        this.setRequired(required);
    }
    set validator(validator: typeof this._validator) {
        this.setValidator(validator);
    }

    constructor(data?: Partial<MessageCommandOptionData>) {
        if (data?.name !== undefined) this.setName(data.name);
        if (data?.description !== undefined) this.setDescription(data.description);
        if (data?.required !== undefined) this.setRequired(data.required);
        if (data?.validator !== undefined) this.setValidator(data.validator);
    }

    /**
     * Set command option name
     * @param name Option name
     */
    public setName(name: string): this {
        if (isValidationEnabled() && (typeof name !== 'string' || !name.match(/^[\w-]{1,32}$/))) throw new TypeError('name must be a string and match the regex /^[\\w-]{1,32}$/.');
        this._name = name;
        return this;
    }

    /**
     * Set command option description
     * @param description Option description
     */
    public setDescription(description: string): this {
        if (isValidationEnabled() && (!description || typeof description !== 'string')) throw new TypeError('description must be a string.');
        this._description = description;
        return this;
    }

    /**
     * Set if this option is required
     * @param required `true` if this option is required
     */
    public setRequired(required: boolean): this {
        this._required = !!required;
        return this;
    }

    /**
     * Set your custom function to validate given value for this option
     * @param validator Custom function to validate value given for this option
     */
    public setValidator(validator?: (value: string) => Awaitable<boolean>): this {
        if (isValidationEnabled() && validator !== undefined && typeof validator !== 'function') throw new TypeError('validator must be a function.');
        this._validator = validator;
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

    /**
     * Resolves message command option data/builder
     * @param option Option data to resolve
     */
    public static resolveMessageCommandOption(option: MessageCommandOptionResolvable): MessageCommandOptionBuilder {
        return this.isMessageCommandOption(option) ? option : new MessageCommandOptionBuilder(option);
    }

    /**
     * Is a Message command option builder
     * @param builder data to check
     */
    public static isMessageCommandOption(builder: unknown): builder is MessageCommandOptionBuilder {
        return builder instanceof MessageCommandOptionBuilder;
    }

    public static async validateOption(option: MessageCommandOptionResolvable, value?: string): Promise<MessageCommandValidatedOption> {
        const validatedOption: MessageCommandValidatedOption = {
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

        const validate = option.validator !== undefined ? await Promise.resolve(option.validator(value ?? '')) : true;
        if (!validate) validatedOption.invalid = true;

        return validatedOption;
    }
}
