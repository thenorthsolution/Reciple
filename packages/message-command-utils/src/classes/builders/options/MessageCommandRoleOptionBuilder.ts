import type { MessageCommandOptionBuilderData, MessageCommandOptionBuilderResolveValueOptions, MessageCommandOptionManager } from '@reciple/core';
import { BaseMessageCommandOptionBuilder } from '../../structures/BaseMessageCommandOptionBuilder.js';
import { Mentions } from '@reciple/utils';
import { Role } from 'discord.js';

export interface MessageCommandRoleOptionBuilderData extends MessageCommandOptionBuilderData<Role|null> {
    allow_everyone?: boolean;
}

export class MessageCommandRoleOptionBuilder extends BaseMessageCommandOptionBuilder<Role|null> implements MessageCommandRoleOptionBuilderData {
    public allow_everyone?: boolean = false;

    constructor(data?: MessageCommandRoleOptionBuilderData) {
        super(data);
        if (typeof data?.allow_everyone === 'boolean') this.setAllowEveryone(data.allow_everyone);
    }

    /**
     * Sets the value of `allow_everyone` to the provided `allowEveryone` parameter and returns the current instance.
     *
     * @param {boolean} allowEveryone - The value to set `allow_everyone` to. If not provided, `allow_everyone` will be set to `undefined`.
     * @return {this} The current instance of the class.
     */
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

    /**
     * Asynchronously resolves a role option from the given option manager.
     */
    public static async resolveOption(name: string, options: MessageCommandOptionManager, required?: boolean): Promise<Role|null> {
        return super.resolveOption(name, options, required);
    }
}
