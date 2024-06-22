import { MessageCommandOptionBuilderData, MessageCommandOptionBuilderResolveValueOptions, MessageCommandOptionManager } from '@reciple/core';
import { BaseMessageCommandOptionBuilder } from '../structures/BaseMessageCommandOptionBuilder.js';
import { Channel, ChannelType, normalizeArray, RestOrArray } from 'discord.js';
import { Mentions } from '@reciple/utils';

export interface MessageCommandChannelOptionBuilderData extends MessageCommandOptionBuilderData<Channel|null> {
    channel_types?: ChannelType[];
    allow_outside_channels?: boolean;
}

export class MessageCommandChannelOptionBuilder extends BaseMessageCommandOptionBuilder<Channel|null> implements MessageCommandChannelOptionBuilderData {
    public channel_types: ChannelType[] = [];
    public allow_outside_channels?: boolean = false;

    constructor(data?: MessageCommandChannelOptionBuilderData) {
        super(data);
        if (data?.channel_types) this.setChannelTypes(data.channel_types);
        if (typeof data?.allow_outside_channels === 'boolean') this.setAllowOutsideChannels(data.allow_outside_channels);
    }

    /**
     * Sets the channel types for the MessageCommandChannelOptionBuilder.
     *
     * @param {...RestOrArray<ChannelType>} channel_types - The channel types to set.
     * @return {this} - The updated MessageCommandChannelOptionBuilder instance.
     */
    public setChannelTypes(...channel_types: RestOrArray<ChannelType>): this {
        this.channel_types = normalizeArray(channel_types);
        return this;
    }

    /**
     * Adds channel types to the MessageCommandChannelOptionBuilder.
     *
     * @param {...RestOrArray<ChannelType>} channel_types - The channel types to add.
     * @return {this} - The updated MessageCommandChannelOptionBuilder instance.
     */
    public addChannelTypes(...channel_types: RestOrArray<ChannelType>): this {
        this.channel_types.push(...normalizeArray(channel_types));
        return this;
    }

    /**
     * Sets the value of allow_outside_channels to the provided boolean value.
     *
     * @param {boolean} allow_outside_channels - The boolean value to set. If not provided, the value will be undefined.
     * @return {this} - The updated instance of the class.
     */
    public setAllowOutsideChannels(allow_outside_channels?: boolean): this {
        this.allow_outside_channels = allow_outside_channels;
        return this;
    }

    public readonly resolve_value = async (options: MessageCommandOptionBuilderResolveValueOptions): Promise<Channel|null> => {
        return Mentions.fetchChannel(options.value, { client: options.client });
    }

    public readonly validate = async (options: MessageCommandOptionBuilderResolveValueOptions): Promise<boolean|Error> => {
        if (!Mentions.getChannelId(options.value)) return new Error(`Value for ${options.option.name} is not a channel ID or channel mention`);

        const channel = await Mentions.fetchChannel(options.value, { client: options.client }).catch(() => null);

        if (!channel) return new Error(`Channel ${options.value} not found`);
        if (this.channel_types?.length && !this.channel_types.includes(channel.type)) return new Error(`Channel ${'name' in channel ? (channel.name + ' ') : ''}(${channel.id}) is not a valid channel type`);
        if (!this.allow_outside_channels) {
            if (options.message.inGuild() && (channel.isDMBased() || channel.guildId !== options.message.guildId)) return new Error(`Channel ${'name' in channel ? (channel.name + ' ') : ''}(${channel.id}) is not in ${options.message.guild.name}`);
            if (!options.message.inGuild() && channel.id !== options.message.channelId) return new Error(`Other channels outside this Channel is not allowed.`);
        }

        return true;
    }

    /**
     * Asynchronously resolves a channel option from the given manager.
     *
     * @param {string} name - The name of the option to resolve.
     * @param {MessageCommandOptionManager} options - The option manager to resolve from.
     * @param {boolean} [required] - Whether the option is required or not.
     * @return {Promise<Channel|null>} - A promise that resolves to the resolved channel or null.
     */
    public static async resolveOption(name: string, options: MessageCommandOptionManager, required?: boolean): Promise<Channel|null> {
        return super.resolveOption(name, options, required);
    }
}
