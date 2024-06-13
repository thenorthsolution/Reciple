import { MessageCommandOptionBuilder, MessageCommandOptionBuilderData, MessageCommandOptionBuilderResolveValueOptions } from '@reciple/core';
import { MessageCommandOptionBuilderWithoutValidateResolve } from '../types/types.js';
import { Mentions } from '@reciple/utils';
import { Channel, ChannelType, Constructable } from 'discord.js';

export interface MessageCommandChannelOptionBuilderData extends MessageCommandOptionBuilderData<Channel|null> {
    channel_types?: ChannelType[]|null;
    allow_outside_channels?: boolean;
}

export class MessageCommandChannelOptionBuilder extends (MessageCommandOptionBuilder<Channel|null> as Constructable<MessageCommandOptionBuilderWithoutValidateResolve<Channel|null>>) implements MessageCommandChannelOptionBuilderData {
    public channel_types?: ChannelType[]|null = null;
    public allow_outside_channels?: boolean = false;

    constructor(data?: MessageCommandChannelOptionBuilderData) {
        super(data);
    }

    public setChannelTypes(channel_types?: ChannelType[]|null): this {
        this.channel_types = channel_types;
        return this;
    }

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
}
