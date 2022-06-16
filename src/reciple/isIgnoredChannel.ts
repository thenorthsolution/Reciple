import { Config } from './classes/Config';

export default function (channelId: string, ignoredChannelsConfig?: Config["ignoredChannels"]): boolean {
    if (!ignoredChannelsConfig?.enabled) return false;
    if (ignoredChannelsConfig.channels.includes(channelId) && !ignoredChannelsConfig.convertToAllowList) return true;
    if (!ignoredChannelsConfig.channels.includes(channelId) && ignoredChannelsConfig.convertToAllowList) return true;

    return false;
}
