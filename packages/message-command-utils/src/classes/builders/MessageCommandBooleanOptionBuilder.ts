import { MessageCommandOptionBuilderData, MessageCommandOptionBuilderResolveValueOptions } from '@reciple/core';
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
}
