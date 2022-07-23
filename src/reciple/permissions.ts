import { Config } from './classes/RecipleConfig';
import { RecipleCommandBuilders } from './types/builders';

import { Guild, PermissionResolvable, PermissionsBitField } from 'discord.js';

/**
 * Check if the user has permissions to execute the given command name
 */
export function userHasCommandPermissions(commandName: string, memberPermissions?: PermissionsBitField, configConmmandPermissions?: Config['commands']['messageCommand']['permissions']|Config['commands']['interactionCommand']['permissions'], builder?: RecipleCommandBuilders): boolean {
    if (!configConmmandPermissions?.enabled) return true;

    const command = configConmmandPermissions.commands.find(c => c.command.toLowerCase() === commandName.toLowerCase()) ?? { permissions: builder?.RequiredUserPermissions ?? [] };
    if (!command.permissions.length) return true;
    
    return memberPermissions ? memberPermissions.has(command.permissions) : false;
}

/**
 * Check if the bot has the required permissions in a guild
 */
export function botHasExecutePermissions(guild?: Guild, requiredPermissions?: PermissionResolvable[]): boolean {
    if (!requiredPermissions?.length) return true;

    return guild?.members.me ? guild.members.me?.permissions.has(requiredPermissions) : false;
}

/**
 * Check if the channel id is ignored in config file 
 */
export function isIgnoredChannel(channelId: string, ignoredChannelsConfig?: Config["ignoredChannels"]): boolean {
    if (!ignoredChannelsConfig?.enabled) return false;
    if (ignoredChannelsConfig.channels.includes(channelId) && !ignoredChannelsConfig.convertToAllowList) return true;
    if (!ignoredChannelsConfig.channels.includes(channelId) && ignoredChannelsConfig.convertToAllowList) return true;

    return false;
}
