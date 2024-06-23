import type { MessageCommandOptionBuilderData, MessageCommandOptionBuilderResolveValueOptions, MessageCommandOptionManager } from '@reciple/core';
import { BaseMessageCommandOptionBuilder } from '../structures/BaseMessageCommandOptionBuilder.js';
import { boolean, isBooleanable } from 'boolean';

export interface MessageCommandBooleanOptionBuilderData extends MessageCommandOptionBuilderData<boolean> {}

export class MessageCommandBooleanOptionBuilder extends BaseMessageCommandOptionBuilder<boolean> implements MessageCommandBooleanOptionBuilderData {
    constructor(data?: MessageCommandBooleanOptionBuilderData) {
        super(data);
    }

    public readonly resolve_value = (options: MessageCommandOptionBuilderResolveValueOptions): boolean => {
        return boolean(options.value);
    }

    public readonly validate = (options: MessageCommandOptionBuilderResolveValueOptions): boolean|Error => {
        if (!isBooleanable(options.value)) return new Error('Value is not booleanable');
        return true;
    }

    public static async resolveOption(name: string, options: MessageCommandOptionManager, required?: false): Promise<boolean|null>;
    public static async resolveOption(name: string, options: MessageCommandOptionManager, required?: true): Promise<boolean>
    public static async resolveOption(name: string, options: MessageCommandOptionManager, required?: boolean): Promise<boolean|null>;
    /**
     * Asynchronously resolves a boolean option from the given manager.
     *
     * @param {string} name - The name of the option to resolve.
     * @param {MessageCommandOptionManager} options - The option manager to resolve from.
     * @param {boolean} [required=false] - Whether the option is required or not.
     * @return {Promise<boolean|null>} - A promise that resolves to the resolved boolean value, or null if the option is not present and not required.
     */
    public static async resolveOption(name: string, options: MessageCommandOptionManager, required?: boolean): Promise<boolean|null> {
        return super.resolveOption(name, options, required);
    }
}
