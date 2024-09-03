import type { MessageCommandFlagBuilder, MessageCommandFlagBuilderResolveValueOptions } from '../builders/MessageCommandFlagBuilder.js';
import type { MessageCommandBuilder } from '../builders/MessageCommandBuilder.js';
import type { CommandData } from '../../types/structures.js';
import type { RecipleClient } from './RecipleClient.js';
import { RecipleError } from './RecipleError.js';
import type { Message } from 'discord.js';

export interface MessageCommandFlagValueData<T extends any = any, V extends 'string'|'boolean' = 'string'|'boolean'> {
    /**
     * The name of the option.
     */
    name: string;
    /**
     * The builder that is used to create the option.
     */
    flag: MessageCommandFlagBuilder<T>;
    /**
     * The raw value of the option.
     */
    values: V extends 'boolean' ? boolean[] : V extends 'string' ? string[] : string[]|boolean[];
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

export interface MessageCommandFlagParseOptionValueOptions<T extends any = any> extends Omit<MessageCommandFlagBuilderResolveValueOptions<T>, 'values'> {
    values?: T[]|null;
}

export interface MessageCommandFlagValueOptions<T extends any = any, V extends 'string'|'boolean' = 'string'|'boolean'> extends MessageCommandFlagValueData<T, V>, Pick<MessageCommandFlagParseOptionValueOptions<T>, 'parserData'|'command'> {
    client: RecipleClient<true>;
    message: Message;
}

export class MessageCommandFlagValue<T extends any = any, V extends 'string'|'boolean' = 'string'|'boolean'> implements MessageCommandFlagValueData<T> {
    readonly name: string;
    readonly flag: MessageCommandFlagBuilder<T>;
    readonly values: V extends 'boolean' ? boolean[] : V extends 'string' ? string[] : string[]|boolean[];
    readonly missing: boolean;
    readonly invalid: boolean;
    readonly message: Message;
    readonly error?: Error;

    readonly parserData: CommandData;
    readonly command: MessageCommandBuilder;
    readonly client: RecipleClient<true>;

    constructor(options: MessageCommandFlagValueOptions<T, V>) {
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
        if (!this.values.length) return [];

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

    public toJSON(): MessageCommandFlagValueData<T> {
        return {
            name: this.name,
            flag: this.flag,
            values: this.values,
            missing: this.missing,
            invalid: this.invalid,
            error: this.error,
        }
    }

    public static async parseFlagValue<T extends any = any>(options: MessageCommandFlagParseOptionValueOptions<T>): Promise<MessageCommandFlagValue<T>> {
        const filteredValues = options.values?.filter(value => typeof value == options.flag.value_type);
        const missing = !!options.flag.required && !filteredValues?.length;

        const validateData = !missing
            ? options.flag.validate && filteredValues?.length
                ? await Promise.resolve(options.flag.validate({
                    values: filteredValues as string[]|boolean[],
                    flag: options.flag,
                    parserData: options.parserData,
                    command: options.command,
                    message: options.message,
                    client: options.client,
                }))
                : true
            : new RecipleError(RecipleError.createCommandRequiredFlagNotFoundErrorOptions(options.flag.name, filteredValues?.join(', ') ?? 'undefined'));

        return new MessageCommandFlagValue({
            name: options.flag.name,
            flag: options.flag,
            values: (filteredValues ?? []) as string[]|boolean[],
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
