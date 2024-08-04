import type { Message } from 'discord.js';
import type { CommandData } from '../../types/structures.js';
import type { MessageCommandBuilder } from '../builders/MessageCommandBuilder.js';
import type { MessageCommandFlagBuilder, MessageCommandFlagBuilderResolveValueOptions } from '../builders/MessageCommandFlagBuilder.js';
import type { RecipleClient } from './RecipleClient.js';

export interface MessageCommandFlagValueData<V extends string|boolean = string|boolean, T extends any = V> {
    /**
     * The name of the option.
     */
    name: string;
    /**
     * The builder that is used to create the option.
     */
    flag: MessageCommandFlagBuilder<V, T>;
    /**
     * The raw value of the option.
     */
    values: V[];
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

export interface MessageCommandFlagParseOptionValueOptions<V extends string|boolean = string|boolean, T extends any = V> extends Omit<MessageCommandFlagBuilderResolveValueOptions<V, T>, 'values'> {
    values?: V[]|null;
}

export interface MessageCommandFlagValueOptions<V extends string|boolean = string|boolean, T extends any = V> extends MessageCommandFlagValueData<V, T>, Pick<MessageCommandFlagParseOptionValueOptions<V, T>, 'parserData'|'command'> {
    client: RecipleClient<true>;
    message: Message;
}

export class MessageCommandFlagValue<V extends string|boolean = string|boolean, T extends any = V> implements MessageCommandFlagValueData<V, T> {
    readonly name: string;
    readonly flag: MessageCommandFlagBuilder<V, T>;
    readonly values: V[];
    readonly missing: boolean;
    readonly invalid: boolean;
    readonly message: Message;
    readonly error?: Error;

    readonly parserData: CommandData;
    readonly command: MessageCommandBuilder;
    readonly client: RecipleClient<true>;

    constructor(options: MessageCommandFlagValueOptions<V, T>) {
        this.name = options.name;
        this.flag = options.flag;
        this.values = options.values;
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
    public async resolveValues(): Promise<T[]> {
        if (this.values.length) return [];

        return this.flag.resolve_value
            ? Promise.resolve(this.flag.resolve_value({
                values: this.values,
                flag: this.flag,
                parserData: this.parserData,
                command: this.command,
                message: this.message,
                client: this.client,
            }))
            : [];
    }

    public toJSON(): MessageCommandFlagValueData<V, T> {
        return {
            name: this.name,
            flag: this.flag,
            values: this.values,
            missing: this.missing,
            invalid: this.invalid,
            error: this.error,
        }
    }

    public static async parseFlagValue<V extends string|boolean = string|boolean, T extends any = V>(options: MessageCommandFlagParseOptionValueOptions<V, T>): Promise<MessageCommandFlagValue<V, T>> {
        const missing = options.values
            ? !!options.flag.required && !options.values?.length
            : options.flag.mandatory ?? false;

        const validateData = !missing
            ? options.flag.validate && options.values?.length
                ? await Promise.resolve(options.flag.validate({
                    values: options.values,
                    flag: options.flag,
                    parserData: options.parserData,
                    command: options.command,
                    message: options.message,
                    client: options.client,
                }))
                : true
            : false;

        return new MessageCommandFlagValue({
            name: options.flag.name,
            flag: options.flag,
            values: options.values ?? [],
            missing,
            invalid: !validateData,
            message: options.message,
            error: typeof validateData !== 'boolean'
                ? typeof validateData === 'string' ? new Error(validateData) : validateData
                : undefined,
            parserData: options.parserData,
            command: options.command,
            client: options.client,
        })
    }
}
