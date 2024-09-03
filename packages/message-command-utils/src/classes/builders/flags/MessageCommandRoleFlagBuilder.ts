import type { Role } from 'discord.js';
import { BaseMessageCommandFlagBuilder } from '../../structures/BaseMessageCommandFlagBuilder.js';
import type { MessageCommandFlagBuilderData, MessageCommandFlagBuilderResolveValueOptions, MessageCommandFlagManager } from '@reciple/core';
import { Mentions } from '@reciple/utils';

export interface MessageCommandRoleFlagBuilderData extends MessageCommandFlagBuilderData<Role> {
    allow_everyone?: boolean;
}

export class MessageCommandRoleFlagBuilder extends BaseMessageCommandFlagBuilder<Role> implements MessageCommandRoleFlagBuilderData {
    public allow_everyone?: boolean = false;

    constructor(data?: MessageCommandRoleFlagBuilderData) {
        super(data);
        if (typeof data?.allow_everyone === 'boolean') this.setAllowEveryone(data.allow_everyone);
    }

    public setAllowEveryone(allowEveryone?: boolean): this {
        this.allow_everyone = allowEveryone;
        return this;
    }

    public readonly resolve_value = async (options: MessageCommandFlagBuilderResolveValueOptions<Role>): Promise<Role[]> => {
        const roles: Role[] = [];

        for (const value of options.values.map(String)) {
            const role = await Mentions.fetchRole(value, { client: options.client, guild: options.message.guild! });
            if (role) roles.push(role);
        }

        return roles;
    }

    public readonly validate = async (options: MessageCommandFlagBuilderResolveValueOptions<Role>): Promise<boolean|Error> => {
        for (const value of options.values.map(String)) {
            if (!Mentions.getRoleId(value)) return new Error(`A value for ${options.flag.name} is not a role ID or role mention`);
            if (!options.message.inGuild()) return new Error(`Cannot resolve ${options.flag.name} value for a DM channel`);
            if (!this.allow_everyone && value === '@everyone') return new Error(`Everyone role is not allowed for ${options.flag.name}`);

            const role = await Mentions.fetchRole(value, { client: options.client, guild: options.message.guild }).catch(() => null);
            if (!role) return new Error(`Role ${value} not found`);
        }

        return true;
    }

    public readonly value_type: 'string' = 'string';

    public static async resolveFlag(name: string, options: MessageCommandFlagManager, required?: boolean): Promise<Role[]> {
        return super.resolveFlag(name, options, required);
    }
}
