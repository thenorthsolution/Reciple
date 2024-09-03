import { MessageCommandOptionBuilder, MessageCommandOptionValidators, type MessageCommandOptionBuilderData, type MessageCommandOptionBuilderResolveValueOptions, type MessageCommandOptionManager } from '@reciple/core';
import type { Awaitable } from 'discord.js';

export abstract class BaseMessageCommandOptionBuilder<T extends any = any> extends (MessageCommandOptionBuilder as (new <T extends any>(options?: MessageCommandOptionBuilderData<T>) => Omit<MessageCommandOptionBuilder<T>, 'setName'|'setDescription'|'setRequired'|'setResolveValue'|'setValidate'>))<T> {
    /**
     * Initializes a new instance of the MessageCommandBooleanOptionBuilder class.
     *
     * @param {MessageCommandBooleanOptionBuilderData<T>} [data] - Optional data to initialize the builder with.
     */
    constructor(data?: MessageCommandOptionBuilderData<T>) {
        super(data);
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

    public abstract readonly resolve_value?: ((options: MessageCommandOptionBuilderResolveValueOptions<T>) => Awaitable<T>) | undefined;
    public abstract readonly validate?: ((options: MessageCommandOptionBuilderResolveValueOptions<T>) => Awaitable<boolean|string|Error>) | undefined;

    public static async resolveOption(name: string, options: MessageCommandOptionManager, required?: boolean): Promise<any|null> {
        switch (required) {
            case true:
                return options.getOptionValue(name, { resolveValue: true, required: true });
            case false:
            case undefined:
                return options.getOptionValue(name, { resolveValue: true, required: false });
        }
    }
}
