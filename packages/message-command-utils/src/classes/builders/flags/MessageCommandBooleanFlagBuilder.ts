import type { MessageCommandFlagBuilderData, MessageCommandFlagBuilderResolveValueOptions, MessageCommandFlagManager } from '@reciple/core';
import { BaseMessageCommandFlagBuilder } from '../../structures/BaseMessageCommandFlagBuilder.js';
import { boolean, isBooleanable } from 'boolean';

export class MessageCommandBooleanFlagBuilder extends BaseMessageCommandFlagBuilder<boolean> {
    public constructor(data?: MessageCommandFlagBuilderData<boolean>) {
        super(data);
    }


    public readonly resolve_value = (options: MessageCommandFlagBuilderResolveValueOptions<boolean>): boolean[] => {
        return options.values.map(v => boolean(v));
    }

    public readonly validate = (options: MessageCommandFlagBuilderResolveValueOptions<boolean>): boolean|Error => {
        if (!options.values.every(v => isBooleanable(v))) return new Error('Values are not booleanable');
        return true;
    }

    public readonly value_type: 'boolean' = 'boolean';

    /**
     * Asynchronously resolves a boolean flag from the given flag manager.
     */
    public static async resolveFlag(name: string, options: MessageCommandFlagManager, required?: boolean): Promise<boolean[]> {
        return super.resolveFlag(name, options, required);
    }
}
