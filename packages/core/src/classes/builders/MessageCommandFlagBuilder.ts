import { isJSONEncodable, normalizeArray, type Awaitable, type JSONEncodable, type Message, type RestOrArray } from 'discord.js';
import type { CommandData } from '../../types/structures.js';
import type { MessageCommandBuilder } from './MessageCommandBuilder.js';
import type { RecipleClient } from '../structures/RecipleClient.js';
import { MessageCommandFlagValidators } from '../validators/MessageCommandFlagValidator.js';

export interface MessageCommandFlagBuilderResolveValueOptions<V extends string|boolean = string|boolean, T extends any = V> {
    /**
     * The values of the given flag
     */
    values: V[];
    /**
     * The parser data when parsing this command.
     */
    parserData: CommandData;
    /**
     * The flag builder used to build this option.
     */
    flag: MessageCommandFlagBuilder<V, T>;
    /**
     * The command builder used to build this command.
     */
    command: MessageCommandBuilder;
    /**
     * The message that triggered this command.
     */
    message: Message;
    /**
     * The client instance
     */
    client: RecipleClient<true>;
}

export interface MessageCommandFlagBuilderData<V extends string|boolean = string|boolean, T extends any = V> {
    name: string;
    short?: string;
    description: string;
    default_values?: V[];
    required?: boolean;
    mandatory?: boolean;
    multiple?: boolean;
    /**
     * The function that validates the option value.
     * @param options The option value and message.
     */
    validate?: (options: MessageCommandFlagBuilderResolveValueOptions<V, T>) => Awaitable<boolean|string|Error>;
    /**
     * Resolves the option value.
     * @param options The option value and message.
     */
    resolve_value?: (options: MessageCommandFlagBuilderResolveValueOptions<V, T>) => Awaitable<T[]>;
}

export class MessageCommandFlagBuilder<V extends string|boolean = string|boolean, T extends any = V> implements MessageCommandFlagBuilderData<V, T> {
    public name: string = '';
    public short?: string;
    public description: string = '';
    public default_values?: V[];
    public required: boolean = false;
    public mandatory?: boolean = false;
    public multiple?: boolean = false;
    public validate?: (options: MessageCommandFlagBuilderResolveValueOptions<V, T>) => Awaitable<boolean|string|Error>;
    public resolve_value?: (options: MessageCommandFlagBuilderResolveValueOptions<V, T>) => Awaitable<T[]>;

    constructor(data?: Partial<MessageCommandFlagBuilderData<V, T>>) {
        if (data?.name) this.setName(data.name);
        if (data?.short) this.setShort(data.short);
        if (data?.description) this.setDescription(data.description);
        if (data?.default_values) this.setDefaultValues(data.default_values);
        if (data?.required) this.setRequired(data.required);
        if (data?.mandatory) this.setMandatory(data.mandatory);
        if (data?.multiple) this.setMultiple(data.multiple);
        if (data?.validate) this.setValidate(data.validate);
        if (data?.resolve_value) this.setResolveValue(data.resolve_value);
    }

    public setName(name: string): this {
        MessageCommandFlagValidators.isValidName(name);
        this.name = name;
        return this;
    }

    public setShort(short: string): this {
        MessageCommandFlagValidators.isValidShort(short);
        this.short = short;
        return this;
    }

    public setDescription(description: string): this {
        MessageCommandFlagValidators.isValidDescription(description);
        this.description = description;
        return this;
    }

    public setDefaultValues(...defaultValues: RestOrArray<V>): this {
        defaultValues = normalizeArray(defaultValues);
        MessageCommandFlagValidators.isValidDefaultValues(defaultValues);
        this.default_values = defaultValues;
        return this;
    }

    public setRequired(required: boolean): this {
        MessageCommandFlagValidators.isValidRequired(required);
        this.required = required;
        return this;
    }

    public setMandatory(mandatory: boolean): this {
        MessageCommandFlagValidators.isValidMandatory(mandatory);
        this.mandatory = mandatory;
        return this;
    }

    public setMultiple(multiple: boolean): this {
        MessageCommandFlagValidators.isValidMultiple(multiple);
        this.multiple = multiple;
        return this;
    }

    public setValidate(validate: MessageCommandFlagBuilderData<V, T>['validate']): this {
        MessageCommandFlagValidators.isValidValidate(validate);
        this.validate = validate;
        return this;
    }

    public setResolveValue(resolve_value: MessageCommandFlagBuilderData<V, T>['resolve_value']): this {
        MessageCommandFlagValidators.isValidResolveValue(resolve_value);
        this.resolve_value = resolve_value;
        return this;
    }

    public toJSON(): MessageCommandFlagBuilderData<V, T> {
        return {
            name: this.name,
            short: this.short,
            description: this.description,
            default_values: this.default_values,
            required: this.required,
            multiple: this.multiple,
            validate: this.validate,
            resolve_value: this.resolve_value
        };
    }

    public static getFlagValuesType(values: (string|boolean)[]): 'string'|'boolean' {
        const type = typeof values[0];
        return type === 'string' || type === 'boolean' ? type : 'string';
    }

    public static from<V extends string|boolean = string|boolean, T extends any = V>(data: MessageCommandFlagResolvable<V, T>): MessageCommandFlagBuilder<V, T> {
        return new MessageCommandFlagBuilder(isJSONEncodable(data) ? data.toJSON() : data);
    }

    public static resolve<V extends string|boolean = string|boolean, T extends any = V>(data: MessageCommandFlagResolvable<V, T>): MessageCommandFlagBuilder<V, T> {
        return data instanceof MessageCommandFlagBuilder ? data : MessageCommandFlagBuilder.from(data);
    }
}

export type MessageCommandFlagResolvable<V extends string|boolean = string|boolean, T extends any = V> = JSONEncodable<MessageCommandFlagBuilderData<V, T>>|MessageCommandFlagBuilderData<V, T>;
