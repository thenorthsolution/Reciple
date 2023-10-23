import { MessageCommandOptionBuilder } from '../builders/MessageCommandOptionBuilder';
import { RecipleClient } from './RecipleClient';
import { Message } from 'discord.js';

export interface MessageCommandOptionValueData<T extends any = any> {
    name: string;
    option: MessageCommandOptionBuilder<T>;
    value: string|null;
    missing: boolean;
    invalid: boolean;
}

export interface MessageCommandOptionParseOptionValueOptions<T extends any = any> {
    option: MessageCommandOptionBuilder<T>;
    message: Message;
    client: RecipleClient<true>;
    value?: string|null;
}

export class MessageCommandOptionValue<T extends any = any> implements MessageCommandOptionValueData {
    readonly name: string;
    readonly option: MessageCommandOptionBuilder<T>;
    readonly value: string|null;
    readonly missing: boolean;
    readonly invalid: boolean;
    readonly message: Message;
    readonly client: RecipleClient<true>;

    protected constructor(options: MessageCommandOptionValueData<T> & { client: RecipleClient<true>; message: Message; }) {
        this.name = options.name;
        this.option = options.option;
        this.value = options.value;
        this.missing = options.missing;
        this.invalid = options.invalid;
        this.message = options.message;
        this.client = options.client;
    }

    public async resolveValue(required?: false): Promise<T|null>;
    public async resolveValue(required?: true): Promise<T>;
    public async resolveValue(required: boolean = false): Promise<T|null> {
        if (this.value === null) return null;
        return this.option.resolve_value ? Promise.resolve(this.option.resolve_value(this.value, this.message, this.client)) : null;
    }

    public toJSON(): MessageCommandOptionValueData {
        return {
            name: this.name,
            option: this.option,
            value: this.value,
            missing: this.missing,
            invalid: this.invalid
        };
    }

    public static async parseOptionValue<T>(options: MessageCommandOptionParseOptionValueOptions<T>): Promise<MessageCommandOptionValue<T>> {
        const missing = !!options.option.required && typeof options.value !== 'string';
        const invalid = missing || (options.option.validate && options.value ? await Promise.resolve(options.option.validate(options.value, options.message, options.client)) : false);

        return new MessageCommandOptionValue({
            name: options.option.name,
            option: options.option,
            value: options.value ?? null,
            missing,
            invalid,
            client: options.client,
            message: options.message
        });
    }
}
