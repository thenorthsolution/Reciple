import { MessageCommandOptionBuilder, MessageCommandOptionBuilderData, MessageCommandOptionBuilderResolveValueOptions } from '@reciple/core';
import { MessageCommandOptionBuilderWithoutValidateResolve } from '../../types/types.js';

export abstract class BaseMessageCommandOptionBuilder<T extends any = any> extends (MessageCommandOptionBuilder as (new <T extends any>(options?: MessageCommandOptionBuilderData<T>) => MessageCommandOptionBuilderWithoutValidateResolve<T>))<T> {
    constructor(data?: MessageCommandOptionBuilderData<T>) {
        super(data);
    }

    public abstract readonly resolve_value?: ((options: MessageCommandOptionBuilderResolveValueOptions<T>) => any) | undefined;
    public abstract readonly validate?: ((options: MessageCommandOptionBuilderResolveValueOptions<T>) => any) | undefined;
}
