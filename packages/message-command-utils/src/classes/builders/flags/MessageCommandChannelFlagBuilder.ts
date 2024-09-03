import { normalizeArray, type Channel, type ChannelType, type RestOrArray } from 'discord.js';
import { BaseMessageCommandFlagBuilder } from '../../structures/BaseMessageCommandFlagBuilder.js';
import { Mentions } from '@reciple/utils';
import type { MessageCommandFlagBuilderResolveValueOptions, MessageCommandFlagManager } from '@reciple/core';

export interface MessageCommandChannelFlagBuilderData extends BaseMessageCommandFlagBuilder<Channel> {
    channel_types?: ChannelType[];
    allow_outside_channels?: boolean;
}

export class MessageCommandChannelFlagBuilder extends BaseMessageCommandFlagBuilder<Channel> implements MessageCommandChannelFlagBuilderData {
    public channel_types: ChannelType[] = [];
    public allow_outside_channels?: boolean = false;

    constructor(data?: MessageCommandChannelFlagBuilderData) {
        super(data);
        if (data?.channel_types) this.setChannelTypes(data.channel_types);
        if (typeof data?.allow_outside_channels === 'boolean') this.setAllowOutsideChannels(data.allow_outside_channels);
    }

    public setChannelTypes(...channel_types: RestOrArray<ChannelType>): this {
        this.channel_types = normalizeArray(channel_types);
        return this;
    }

    public addChannelTypes(...channel_types: RestOrArray<ChannelType>): this {
        this.channel_types.push(...normalizeArray(channel_types));
        return this;
    }

    public setAllowOutsideChannels(allow_outside_channels?: boolean): this {
        this.allow_outside_channels = allow_outside_channels;
        return this;
    }

    public readonly resolve_value = async (options: MessageCommandFlagBuilderResolveValueOptions<Channel>): Promise<Channel[]> => {
        const channels: Channel[] = [];

        for (const id of options.values) {
            const channel = await Mentions
                .fetchChannel(String(id), { client: options.client })
                .catch(() => {
                    throw new Error(`Channel ${id} not found`);
                });

            if (channel) channels.push(channel);
        }

        return channels;
    }

    public readonly validate = async (options: MessageCommandFlagBuilderResolveValueOptions<Channel>): Promise<boolean|Error> => {
        for (const id of options.values.map(id => String(id))) {
            if (!Mentions.getChannelId(id)) return new Error(`A value for ${options.flag.name} contains a non-channel ID or channel mention value`);

            const channel = await Mentions.fetchChannel(id, { client: options.client }).catch(() => null);

            if (!channel) return new Error(`Channel ${id} not found`);
            if (this.channel_types?.length && !this.channel_types.includes(channel.type)) return new Error(`Channel ${'name' in channel ? (channel.name + ' ') : ''}(${channel.id}) is not a valid channel type`);
            if (!this.allow_outside_channels) {
                if (options.message.inGuild() && (channel.isDMBased() || channel.guildId !== options.message.guildId)) return new Error(`Channel ${'name' in channel ? (channel.name + ' ') : ''}(${channel.id}) is not in ${options.message.guild.name}`);
                if (!options.message.inGuild() && channel.id !== options.message.channelId) return new Error(`Other channels outside this Channel is not allowed.`);
            }
        }

        return true;
    }

    public readonly value_type: 'string' = 'string';

    public static async resolveOption(name: string, options: MessageCommandFlagManager, required?: boolean): Promise<Channel[]> {
        return super.resolveOption(name, options, required);
    }
}
