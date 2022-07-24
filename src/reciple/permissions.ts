import { Config } from './classes/RecipleConfig';
import { RecipleUserHasCommandPermissionsOptions } from './types/paramOptions';

import { Guild, PermissionResolvable } from 'discord.js';

/**
 * Check if the user has permissions to execute the given command name
 * @param options options
 */
export function userHasCommandPermissions(options: RecipleUserHasCommandPermissionsOptions): boolean {
    const command = (
                options.commandPermissions?.enabled
                ? options.commandPermissions?.commands.find(c => c.command.toLowerCase() === options.builder.name.toLowerCase())
                : null
            )
            ?? { permissions: options.builder.requiredUserPermissions };
    if (!command.permissions.length) return true;

    return options.memberPermissions ? options.memberPermissions.has(command.permissions) : false;
}

/**
 * Check if the bot has the required permissions in a guild
 * @param guild Guild
 * @param requiredPermissions Required guild bot permissions
 */
export function botHasExecutePermissions(guild?: Guild, requiredPermissions?: PermissionResolvable[]): boolean {
    if (!requiredPermissions?.length) return true;

    return guild?.members.me ? guild.members.me.permissions.has(requiredPermissions) : false;
}

/**
 * Check if the channel id is ignored in config file 
 * @param channelId Check if channel id is in ignore list
 * @param ignoredChannelsConfig Ignored channels config
 */
export function isIgnoredChannel(channelId: string, ignoredChannelsConfig?: Config["ignoredChannels"]): boolean {
    if (!ignoredChannelsConfig?.enabled) return false;
    if (ignoredChannelsConfig.channels.includes(channelId) && !ignoredChannelsConfig.convertToAllowList) return true;
    if (!ignoredChannelsConfig.channels.includes(channelId) && ignoredChannelsConfig.convertToAllowList) return true;

    return false;
}
