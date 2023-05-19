import { Guild, GuildTextBasedChannel, PermissionResolvable, PermissionsBitField } from 'discord.js';
import { AnyCommandBuilder } from '../types/commands';
import { deprecate } from 'util';

export interface hasExecutePermissionsOptions {
    /**
     * The command builder for the command.
     */
    builder: AnyCommandBuilder;
    /**
     * The member permissions of the user.
     */
    memberPermissions: PermissionsBitField;
}

/**
 * Check if a user has the permissions to execute a command.
 * @param options The options for the permission check.
 */
export function hasExecutePermissions(options: hasExecutePermissionsOptions): boolean {
    const requiredPermissions = (options.builder.requiredMemberPermissions ?? (options.builder.isContextMenu() || options.builder.isSlashCommand() ? options.builder.default_member_permissions : undefined)) || undefined;
    if (typeof requiredPermissions !== 'bigint') return true;

    return options.memberPermissions.has(requiredPermissions);
}

/**
 * Check if a bot has the permissions to execute a command in a guild or channel.
 * @param guildOrChannel The guild or channel where the command is being executed.
 * @param requiredPermissions The required permissions for the command.
 */
export function botHasPermissionsToExecute(guildOrChannel: Guild|GuildTextBasedChannel, requiredPermissions: PermissionResolvable): boolean {
    let permissions: PermissionsBitField|null = null;

    if (guildOrChannel instanceof Guild) {
        permissions = guildOrChannel.members.me?.permissions ?? null;
    } else {
        permissions = guildOrChannel?.permissionsFor(guildOrChannel.client.user.id) ?? null;
    }

    return !!permissions?.has(requiredPermissions);
}

// TODO: Remove deprecated

/**
 * @deprecated Use hasExecutePermissionsOptions instead
 */
export interface userHasExecutePermissionsOptions extends hasExecutePermissionsOptions {}

/**
 * @deprecated Use hashasExecutePermissions instead
 */
export const memberHasExecutePermissions = deprecate(function memberHasExecutePermissions(options: userHasExecutePermissionsOptions) {
    return hasExecutePermissions(options);
}, 'memberHasExecutePermissions() is deprecated. Use hasExecutePermissions() instead.');
