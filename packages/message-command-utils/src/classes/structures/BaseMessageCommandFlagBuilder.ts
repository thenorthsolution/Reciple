import { MessageCommandFlagBuilder, MessageCommandFlagValidators, type MessageCommandFlagBuilderData, type MessageCommandFlagBuilderResolveValueOptions, type MessageCommandFlagManager } from '@reciple/core';
import type { Awaitable } from 'discord.js';

export abstract class BaseMessageCommandFlagBuilder<T extends any = any> extends (MessageCommandFlagBuilder as (new <T extends any>(options?: MessageCommandFlagBuilderData<T>) => Omit<MessageCommandFlagBuilder<T>, 'setName'|'setDescription'|'setRequired'|'setResolveValue'|'setValidate'|'setValueType'>))<T> {
    /**
     * Initializes a new instance of the MessageCommandBooleanFlagBuilder class.
     *
     * @param {MessageCommandBooleanFlagBuilderData<T>} [data] - Optional data to initialize the builder with.
     */
    constructor(data?: MessageCommandFlagBuilderData<T>) {
        super(data);
    }

    /**
     * Sets the name of the flag.
     * @param name Name of the flag.
     */
    public setName(name: string): this {
        MessageCommandFlagValidators.isValidName(name);
        this.name = name;
        return this;
    }

    /**
     * Sets the description of the flag.
     * @param description Description of the flag.
     */
    public setDescription(description: string): this {
        MessageCommandFlagValidators.isValidDescription(description);
        this.description = description;
        return this;
    }

    /**
     * Sets whether the flag is required.
     * @param required Flag is required.
     */
    public setRequired(required: boolean): this {
        MessageCommandFlagValidators.isValidRequired(required);
        this.required = required;
        return this;
    }

    public abstract readonly resolve_value?: ((options: MessageCommandFlagBuilderResolveValueOptions<T>) => Awaitable<T[]>) | undefined;
    public abstract readonly validate?: ((options: MessageCommandFlagBuilderResolveValueOptions<T>) => Awaitable<boolean|string|Error>) | undefined;
    public abstract readonly value_type?: 'string' | 'boolean' | undefined;

    public static async resolveOption(name: string, options: MessageCommandFlagManager, required?: boolean): Promise<any[]> {
        switch (required) {
            case true:
                return options.getFlagValues(name, { resolveValue: true, required: true });
            case false:
            case undefined:
                return options.getFlagValues(name, { resolveValue: true, required: false });
        }
    }
}
