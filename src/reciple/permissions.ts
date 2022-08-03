import { UserHasCommandPermissionsOptions } from './types/paramOptions';
import { Guild, PermissionResolvable } from 'discord.js';
import { Config } from './classes/RecipleConfig';

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
 * @param guild Guild
 * @param requiredPermissions Required guild bot permissions
 */
export function botHasExecutePermissions(guild?: Guild, requiredPermissions?: PermissionResolvable[]): boolean {
    if (!requiredPermissions?.length) return true;

    return guild?.members.me ? guild.members.me.permissions.has(requiredPermissions) : false;
}
