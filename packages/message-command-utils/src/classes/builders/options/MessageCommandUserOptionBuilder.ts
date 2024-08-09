import type { MessageCommandOptionBuilderData, MessageCommandOptionBuilderResolveValueOptions, MessageCommandOptionManager } from '@reciple/core';
import { BaseMessageCommandOptionBuilder } from '../../structures/BaseMessageCommandOptionBuilder.js';
import { Mentions } from '@reciple/utils';
import { User } from 'discord.js';

export interface MessageCommandUserOptionBuilderData extends MessageCommandOptionBuilderData<User> {
    allow_bots?: boolean;
}

export class MessageCommandUserOptionBuilder extends BaseMessageCommandOptionBuilder<User> implements MessageCommandUserOptionBuilderData {
    public allow_bots?: boolean = true;

    constructor(data?: MessageCommandUserOptionBuilderData) {
        super(data);

        if (typeof data?.allow_bots === 'boolean') this.setAllowBots(data.allow_bots);
    }

    /**
     * Sets the value of `allow_bots` property and returns the current instance.
     *
     * @param {boolean} [allowBots] - The new value for `allow_bots`. If not provided, it will be set to `undefined`.
     * @return {this} The current instance of the class.
     */
    public setAllowBots(allowBots?: boolean): this {
        this.allow_bots = allowBots;
        return this;
    }

    public readonly resolve_value = async (options: MessageCommandOptionBuilderResolveValueOptions): Promise<User> => {
        return Mentions.fetchUser(options.value, { client: options.client });
    }

    public readonly validate = async (options: MessageCommandOptionBuilderResolveValueOptions): Promise<boolean|Error> => {
        if (!Mentions.getUserId(options.value)) return new Error(`Value for ${options.option.name} is not a user ID or user mention`);

        const user = await Mentions.fetchUser(options.value, { client: options.client }).catch(() => null);
        if (!user) return new Error(`User ${options.value} not found`);

        if (!this.allow_bots && user.bot) return new Error(`User ${options.value} is a bot`);
        return true;
    }

    public static async resolveOption(name: string, options: MessageCommandOptionManager, required?: false): Promise<User|null>;
    public static async resolveOption(name: string, options: MessageCommandOptionManager, required?: true): Promise<User>
    public static async resolveOption(name: string, options: MessageCommandOptionManager, required?: boolean): Promise<User|null>;
    /**
     * Asynchronously resolves a user option from the given manager.
     *
     * @param {string} name - The name of the option to resolve.
     * @param {MessageCommandOptionManager} options - The option manager to resolve from.
     * @param {boolean} [required=false] - Whether the option is required or not.
     * @return {Promise<User|null>} - A promise that resolves to the resolved user value, or null if the option is not present and not required.
     */
    public static async resolveOption(name: string, options: MessageCommandOptionManager, required?: boolean): Promise<User|null> {
        return super.resolveOption(name, options, required);
    }
}
