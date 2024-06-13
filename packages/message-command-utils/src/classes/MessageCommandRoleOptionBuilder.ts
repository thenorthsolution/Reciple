import { MessageCommandOptionBuilder, MessageCommandOptionBuilderData, MessageCommandOptionBuilderResolveValueOptions } from '@reciple/core';
import { MessageCommandOptionBuilderWithoutValidateResolve } from '../types/types.js';
import { Mentions } from '@reciple/utils';
import { Constructable, Role } from 'discord.js';

export interface MessageCommandRoleOptionBuilderData extends MessageCommandOptionBuilderData<Role|null> {
    allow_everyone?: boolean;
}

export class MessageCommandRoleOptionBuilder extends (MessageCommandOptionBuilder<Role|null> as Constructable<MessageCommandOptionBuilderWithoutValidateResolve<Role|null>>) implements MessageCommandRoleOptionBuilderData {
    public allow_everyone?: boolean = false;

    constructor(data?: MessageCommandRoleOptionBuilderData) {
        super(data);
        if (typeof data?.allow_everyone === 'boolean') this.setAllowEveryone(data.allow_everyone);
    }

    public setAllowEveryone(allowEveryone?: boolean): this {
        this.allow_everyone = allowEveryone;
        return this;
    }

    public readonly resolve_value = async (options: MessageCommandOptionBuilderResolveValueOptions): Promise<Role|null> => {
        return Mentions.fetchRole(options.value, { client: options.client, guild: options.message.guild! });
    }

    public readonly validate = async (options: MessageCommandOptionBuilderResolveValueOptions): Promise<boolean|Error> => {
        if (!Mentions.getRoleId(options.value)) return new Error(`Value for ${options.option.name} is not a role ID or role mention`);
        if (!options.message.inGuild()) return new Error(`Cannot resolve ${options.option.name} value for a DM channel`);
        if (!this.allow_everyone && options.value === '@everyone') return new Error(`Everyone role is not allowed for ${options.option.name}`);

        const role = await Mentions.fetchRole(options.value, { client: options.client, guild: options.message.guild }).catch(() => null);
        if (!role) return new Error(`Role ${options.value} not found`);
        return true;
    }
}
