import { isJSONEncodable, normalizeArray, type Awaitable, type JSONEncodable, type Message, type RestOrArray } from 'discord.js';
import { MessageCommandFlagValidators } from '../validators/MessageCommandFlagValidators.js';
import type { MessageCommandBuilder } from './MessageCommandBuilder.js';
import type { RecipleClient } from '../structures/RecipleClient.js';
import type { CommandData } from '../../types/structures.js';

export interface MessageCommandFlagBuilderResolveValueOptions<T extends any = any> {
    /**
     * The values of the given flag
     */
    values: string[]|boolean[];
    /**
     * The parser data when parsing this command.
     */
    parserData: CommandData;
    /**
     * The flag builder used to build this option.
     */
    flag: MessageCommandFlagBuilder<T>;
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

export interface MessageCommandFlagBuilderData<T extends any = any> {
    /**
     * The name of the flag.
     */
    name: string;
    /**
     * The shortcut of the flag.
     */
    shortcut?: string;
    /**
     * The description of the flag.
     */
    description: string;
    /**
     * The default values of the flag.
     */
    default_values?: string[]|boolean[];
    /**
     * Whether the flag is required.
     */
    required?: boolean;
    /**
     * Whether the flag can have multiple values.
     */
    multiple?: boolean;
    /**
     * The value type of the flag.
     * @default 'string'
     */
    value_type?: 'string'|'boolean';

    /**
     * The function that validates the option value.
     * @param options The option value and message.
     */
    validate?: (options: MessageCommandFlagBuilderResolveValueOptions<T>) => Awaitable<boolean|string|Error>;
    /**
     * Resolves the option value.
     * @param options The option value and message.
     */
    resolve_value?: (options: MessageCommandFlagBuilderResolveValueOptions<T>) => Awaitable<T[]>;
}

export class MessageCommandFlagBuilder<T extends any = any> implements MessageCommandFlagBuilderData<T> {
    public name: string = '';
    public shortcut?: string;
    public description: string = '';
    public default_values?: string[]|boolean[];
    public required: boolean = false;
    public multiple?: boolean = false;
    public value_type?: 'string'|'boolean' = 'string';
    public validate?: (options: MessageCommandFlagBuilderResolveValueOptions<T>) => Awaitable<boolean|string|Error>;
    public resolve_value?: (options: MessageCommandFlagBuilderResolveValueOptions<T>) => Awaitable<T[]>;

    constructor(data?: Partial<MessageCommandFlagBuilderData<T>>) {
        if (data?.name) this.setName(data.name);
        if (data?.shortcut) this.setShortcut(data.shortcut);
        if (data?.description) this.setDescription(data.description);
        if (data?.default_values) this.setDefaultValues(data.default_values);
        if (data?.required) this.setRequired(data.required);
        if (data?.multiple) this.setMultiple(data.multiple);
        if (data?.value_type) this.setValueType(data.value_type);
        if (data?.validate) this.setValidate(data.validate);
        if (data?.resolve_value) this.setResolveValue(data.resolve_value);
    }

    public setName(name: string): this {
        MessageCommandFlagValidators.isValidName(name);
        this.name = name;
        return this;
    }

    public setShortcut(shortcut: string): this {
        MessageCommandFlagValidators.isValidShortcut(shortcut);
        this.shortcut = shortcut;
        return this;
    }

    public setDescription(description: string): this {
        MessageCommandFlagValidators.isValidDescription(description);
        this.description = description;
        return this;
    }

    public setDefaultValues(...defaultValues: RestOrArray<string|boolean>): this {
        defaultValues = normalizeArray(defaultValues) as string[]|boolean[];
        MessageCommandFlagValidators.isValidDefaultValues(defaultValues);
        this.default_values = defaultValues;
        return this;
    }

    public setRequired(required: boolean): this {
        MessageCommandFlagValidators.isValidRequired(required);
        this.required = required;
        return this;
    }

    public setMultiple(multiple: boolean): this {
        MessageCommandFlagValidators.isValidMultiple(multiple);
        this.multiple = multiple;
        return this;
    }

    public setValueType(valueType: 'string'|'boolean'): this {
        MessageCommandFlagValidators.isValidValueType(valueType);
        this.value_type = valueType as any;
        return this as any;
    }

    public setValidate(validate: MessageCommandFlagBuilderData<T>['validate']): this {
        MessageCommandFlagValidators.isValidValidate(validate);
        this.validate = validate;
        return this;
    }

    public setResolveValue(resolve_value: MessageCommandFlagBuilderData<T>['resolve_value']): this {
        MessageCommandFlagValidators.isValidResolveValue(resolve_value);
        this.resolve_value = resolve_value;
        return this;
    }

    public toJSON(): MessageCommandFlagBuilderData<T> {
        return {
            name: this.name,
            shortcut: this.shortcut,
            description: this.description,
            default_values: this.default_values,
            required: this.required,
            multiple: this.multiple,
            value_type: this.value_type,
            validate: this.validate,
            resolve_value: this.resolve_value,
        };
    }

    public static from<T extends any = any>(data: MessageCommandFlagResolvable<T>): MessageCommandFlagBuilder<T> {
        return new MessageCommandFlagBuilder(isJSONEncodable(data) ? data.toJSON() : data);
    }

    public static resolve<T extends any = any>(data: MessageCommandFlagResolvable<T>): MessageCommandFlagBuilder<T> {
        return data instanceof MessageCommandFlagBuilder ? data : MessageCommandFlagBuilder.from(data);
    }
}

export type MessageCommandFlagResolvable<T extends any = any> = JSONEncodable<MessageCommandFlagBuilderData<T>>|MessageCommandFlagBuilderData<T>;
