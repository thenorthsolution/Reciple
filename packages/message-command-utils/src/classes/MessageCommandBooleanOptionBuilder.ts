import { MessageCommandOptionBuilder, MessageCommandOptionBuilderData, MessageCommandOptionBuilderResolveValueOptions } from '@reciple/core';
import { Constructable } from 'discord.js';
import { MessageCommandOptionBuilderWithoutValidateResolve } from '../types/types.js';
import { boolean, isBooleanable } from 'boolean';

export interface MessageCommandBooleanOptionBuilderData extends MessageCommandOptionBuilderData<boolean> {}

export class MessageCommandBooleanOptionBuilder extends (MessageCommandOptionBuilder<boolean> as Constructable<MessageCommandOptionBuilderWithoutValidateResolve<boolean>>) implements MessageCommandBooleanOptionBuilderData {
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
