import { MessageCommandOptionBuilderData, MessageCommandOptionBuilderResolveValueOptions, MessageCommandOptionManager } from '@reciple/core';
import { boolean, isBooleanable } from 'boolean';
import { BaseMessageCommandOptionBuilder } from '../structures/BaseMessageCommandOptionBuilder.js';

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
    public static async resolveOption(name: string, options: MessageCommandOptionManager, required?: boolean): Promise<boolean|null> {
        return super.resolveOption(name, options, required);
    }
}
