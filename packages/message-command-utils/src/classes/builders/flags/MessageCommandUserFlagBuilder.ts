import type { User } from 'discord.js';
import { BaseMessageCommandFlagBuilder } from '../../structures/BaseMessageCommandFlagBuilder.js';
import type { MessageCommandFlagBuilderData, MessageCommandFlagBuilderResolveValueOptions, MessageCommandFlagManager } from '@reciple/core';
import { Mentions } from '@reciple/utils';

export interface MessageCommandUserFlagBuilderData extends MessageCommandFlagBuilderData<User> {
    allow_bots?: boolean;
}

export class MessageCommandUserFlagBuilder extends BaseMessageCommandFlagBuilder<User> implements MessageCommandUserFlagBuilder {
    public allow_bots?: boolean = true;

    constructor(data?: MessageCommandUserFlagBuilderData) {
        super(data);

        if (typeof data?.allow_bots === 'boolean') this.setAllowBots(data.allow_bots);
    }

    public setAllowBots(allowBots?: boolean): this {
        this.allow_bots = allowBots;
        return this;
    }

    public readonly resolve_value = async (options: MessageCommandFlagBuilderResolveValueOptions<User>): Promise<User[]> => {
        const users: User[] = [];

        for (const value of options.values.map(String)) {
            users.push(await Mentions.fetchUser(value, { client: options.client }));
        }

        return users;
    }

    public readonly validate = async (options: MessageCommandFlagBuilderResolveValueOptions<User>): Promise<boolean|Error> => {
        for (const value of options.values.map(String)) {
            if (!Mentions.getUserId(value)) return new Error(`A value for ${options.flag.name} is not a user ID or user mention`);

            const user = await Mentions.fetchUser(value, { client: options.client }).catch(() => null);
            if (!user) return new Error(`User ${value} not found`);

            if (!this.allow_bots && user.bot) return new Error(`A value for ${options.flag.name} is a bot: ${value}`);
        }

        return true;
    }

    public readonly value_type: 'string' = 'string';

    public static async resolveFlag(name: string, options: MessageCommandFlagManager, required?: boolean): Promise<User[]> {
        return super.resolveFlag(name, options, required);
    }
}
