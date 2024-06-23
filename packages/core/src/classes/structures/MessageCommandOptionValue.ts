import type { MessageCommandOptionBuilder, MessageCommandOptionBuilderResolveValueOptions } from '../builders/MessageCommandOptionBuilder.js';
import { MessageCommandBuilder } from '../builders/MessageCommandBuilder.js';
import type { CommandData } from '../../types/structures.js';
import { RecipleClient } from './RecipleClient.js';
import { Message } from 'discord.js';

export interface MessageCommandOptionValueData<T extends any = any> {
    /**
     * The name of the option.
     */
    name: string;
    /**
     * The builder that is used to create the option.
     */
    option: MessageCommandOptionBuilder<T>;
    /**
     * The raw value of the option.
     */
    value: string|null;
    /**
     * Whether the option is missing.
     */
    missing: boolean;
    /**
     * Whether the option is invalid.
     */
    invalid: boolean;
    /**
     * The error that occurred while parsing the option.
     */
    error?: string|Error;
}

export interface MessageCommandOptionParseOptionValueOptions<T extends any = any> extends Omit<MessageCommandOptionBuilderResolveValueOptions<T>, 'value'> {
    value?: string|null;
}

export interface MessageCommandOptionValueOptions<T extends any = any> extends MessageCommandOptionValueData<T>, Pick<MessageCommandOptionParseOptionValueOptions, 'parserData'|'command'> {
    client: RecipleClient<true>;
    message: Message;
}

export class MessageCommandOptionValue<T extends any = any> implements MessageCommandOptionValueData {
    readonly name: string;
    readonly option: MessageCommandOptionBuilder<T>;
    readonly value: string|null;
    readonly missing: boolean;
    readonly invalid: boolean;
    readonly message: Message;
    readonly error?: Error;

    readonly parserData: CommandData;
    readonly command: MessageCommandBuilder;
    readonly client: RecipleClient<true>;

    protected constructor(options: MessageCommandOptionValueOptions<T>) {
        this.name = options.name;
        this.option = options.option;
        this.value = options.value;
        this.missing = options.missing;
        this.invalid = options.invalid;
        this.message = options.message;
        this.error = typeof options.error === 'string' ? new Error(options.error) : options.error;
        this.parserData = options.parserData;
        this.command = options.command;
        this.client = options.client;
    }

    /**
     * Resolves the raw value of the option.
     * @param required Whether the option is required.
     */
    public async resolveValue(required?: boolean): Promise<T|null>;
    public async resolveValue(required?: true): Promise<T>;
    public async resolveValue(required: boolean = false): Promise<T|null> {
        if (this.value === null) return null;
        return this.option.resolve_value ? Promise.resolve(this.option.resolve_value({
            value: this.value,
            option: this.option,
            parserData: this.parserData,
            command: this.command,
            message: this.message,
            client: this.client,
        })) : null;
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
        const validateData = !missing
            ? options.option.validate && options.value
                ? await Promise.resolve(options.option.validate({
                    value: options.value,
                    option: options.option,
                    parserData: options.parserData,
                    command: options.command,
                    message: options.message,
                    client: options.client,
                }))
                : true
            : false;

        return new MessageCommandOptionValue({
            name: options.option.name,
            option: options.option,
            value: options.value ?? null,
            missing,
            invalid: validateData !== true,
            message: options.message,
            error: typeof validateData !== 'boolean'
                ? typeof validateData === 'string' ? new Error(validateData) : validateData
                : undefined,
            parserData: options.parserData,
            command: options.command,
            client: options.client,
        });
    }
}
