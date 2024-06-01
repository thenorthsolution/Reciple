import { MessageCommandOptionValidators } from '../validators/MessageCommandOptionValidators.js';
import { Awaitable, isJSONEncodable, JSONEncodable, Message } from 'discord.js';
import { RecipleClient } from '../structures/RecipleClient.js';

export interface MessageCommandOptionBuilderResolveValueOptions {
    value: string;
    message: Message;
    client: RecipleClient<true>;
}

export interface MessageCommandOptionBuilderData<T extends any = any> {
    /**
     * The name of the option.
     */
    name: string;
    /**
     * The description of the option.
     */
    description: string;
    /**
     * Whether the option is required.
     * @default false
     */
    required?: boolean;
    /**
     * The function that validates the option value.
     * @param options The option value and message.
     */
    validate?: (options: MessageCommandOptionBuilderResolveValueOptions) => Awaitable<boolean|string|Error>;
    /**
     * Resolves the option value.
     * @param options The option value and message.
     */
    resolve_value?: (options: MessageCommandOptionBuilderResolveValueOptions) => Awaitable<T>;
}

export class MessageCommandOptionBuilder<T extends any = any> implements MessageCommandOptionBuilderData<T> {
    public name: string = '';
    public description: string = '';
    public required?: boolean = false;
    public validate?: MessageCommandOptionBuilderData['validate'];
    public resolve_value?: MessageCommandOptionBuilderData['resolve_value'];

    constructor(data?: Partial<MessageCommandOptionBuilderData>) {
        if (data?.name) this.setName(data.name);
        if (data?.description) this.setDescription(data.description);
        if (data?.required) this.setRequired(data.required);
        if (data?.validate) this.setValidate(data.validate);
        if (data?.resolve_value) this.setResolveValue(data.resolve_value);
    }

    /**
     * Sets the name of the option.
     * @param name Name of the options.
     */
    public setName(name: string): this {
        MessageCommandOptionValidators.isValidName(name);
        this.name = name;
        return this;
    }

    /**
     * Sets the description of the option.
     * @param description Description of the option.
     */
    public setDescription(description: string): this {
        MessageCommandOptionValidators.isValidDescription(description);
        this.description = description;
        return this;
    }

    /**
     * Sets whether the option is required.
     * @param required Option is required.
     */
    public setRequired(required: boolean): this {
        MessageCommandOptionValidators.isValidRequired(required);
        this.required = required;
        return this;
    }

    /**
     * Sets the function that validates the option value.
     * @param validate Function that validates the option value.
     */
    public setValidate(validate: MessageCommandOptionBuilderData['validate']|null): this {
        MessageCommandOptionValidators.isValidValidate(validate);
        this.validate = validate ?? undefined;
        return this;
    }

    /**
     * Sets the function that resolves the option value.
     * @param resolveValue Function that resolves the option value.
     */
    public setResolveValue(resolveValue: MessageCommandOptionBuilderData['resolve_value']|null): this {
        MessageCommandOptionValidators.isValidResolveValue(resolveValue);
        this.resolve_value = resolveValue ?? undefined;
        return this;
    }

    public toJSON(): MessageCommandOptionBuilderData {
        return {
            name: this.name,
            description: this.description,
            required: this.required,
            validate: this.validate,
            resolve_value: this.resolve_value
        };
    }

    public static from<T extends any = any>(data: MessageCommandOptionResolvable<T>): MessageCommandOptionBuilder<T> {
        return new MessageCommandOptionBuilder<T>(isJSONEncodable(data) ? data.toJSON() : data);
    }

    public static resolve<T extends any = any>(data: MessageCommandOptionResolvable<T>): MessageCommandOptionBuilder<T> {
        return data instanceof MessageCommandOptionBuilder ? data : this.from(data);
    }
}

export type MessageCommandOptionResolvable<T extends any = any> = MessageCommandOptionBuilderData<T>|JSONEncodable<MessageCommandOptionBuilderData<T>>;
