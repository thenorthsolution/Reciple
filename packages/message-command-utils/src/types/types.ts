import { MessageCommandOptionBuilder } from '@reciple/core';

export type MessageCommandOptionBuilderWithoutValidateResolve<T extends any = any> = Omit<MessageCommandOptionBuilder<T>, 'setValidate'|'setResolveValue'>;
