import { Guild, GuildTextBasedChannel, PermissionResolvable, PermissionsBitField } from 'discord.js';
import { UserHasCommandPermissionsOptions } from './types/paramOptions';

/**
 * Check if the user has permissions to execute the given command name
 * @param options options
 */
export function userHasCommandPermissions(options: UserHasCommandPermissionsOptions): boolean {
    const command = (
                options.commandPermissions?.enabled
                ? options.commandPermissions?.commands.find(c => c.command.toLowerCase() === options.builder.name.toLowerCase())
                : null
            )
            ?? { permissions: options.builder.requiredMemberPermissions };
    if (!command.permissions.length) return true;

    return options.memberPermissions ? options.memberPermissions.has(command.permissions) : false;
}

/**
 * Check if the bot has the required permissions in a guild
 * @param guild Check if the bot has the required permissions in this guild
 * @param requiredPermissions Required guild bot permissions
 */
export function botHasExecutePermissions(guild?: Guild, requiredPermissions?: PermissionResolvable[]): boolean;
/**
 * Check if the bot has the required permissions in a channel
 * @param channel Check if the bot has the required permissions in this channel
 * @param requiredPermissions Required guild bot permissions
 */
export function botHasExecutePermissions(channel?: GuildTextBasedChannel, requiredPermissions?: PermissionResolvable[]): boolean;
export function botHasExecutePermissions(guildOrChannel?: Guild|GuildTextBasedChannel, requiredPermissions?: PermissionResolvable[]): boolean {
    if (!requiredPermissions?.length) return true;

    let permissions: PermissionsBitField|null = null;

    if (guildOrChannel instanceof Guild) {
        permissions = guildOrChannel.members.me?.permissions ?? null;
    } else {
        permissions = guildOrChannel?.permissionsFor(guildOrChannel.client.user!.id) ?? null;
    }

    return permissions ? permissions.has(requiredPermissions) : false;
}
