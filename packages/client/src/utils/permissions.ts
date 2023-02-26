import { Guild, GuildTextBasedChannel, PermissionResolvable, PermissionsBitField } from 'discord.js';
import { AnyCommandBuilder } from '../types/commands';

export interface hasExecutePermissionsOptions {
    builder: AnyCommandBuilder;
    memberPermissions: PermissionsBitField;
}

export function hasExecutePermissions(options: hasExecutePermissionsOptions): boolean {
    const requiredPermissions = (options.builder.requiredMemberPermissions ?? (options.builder.isContextMenu() || options.builder.isSlashCommand() ? options.builder.default_member_permissions : undefined)) || undefined;
    if (typeof requiredPermissions !== 'bigint') return true;

    return options.memberPermissions.has(requiredPermissions);
}

/**
 * @deprecated Use hasExecutePermissionsOptions instead
 */
export interface userHasExecutePermissionsOptions extends hasExecutePermissionsOptions {}

/**
 * @deprecated Use hashasExecutePermissions instead
 */
export function memberHasExecutePermissions(options: userHasExecutePermissionsOptions) {
    // TODO: Remove deprecated
    process.emitWarning('memberHasExecutePermissions() is deprecated! Use hasExecutePermissions() instead', 'DeprecationWarning');
    return hasExecutePermissions(options);
}

export function botHasPermissionsToExecute(guildOrChannel: Guild|GuildTextBasedChannel, requiredPermissions: PermissionResolvable): boolean {
    let permissions: PermissionsBitField|null = null;

    if (guildOrChannel instanceof Guild) {
        permissions = guildOrChannel.members.me?.permissions ?? null;
    } else {
        permissions = guildOrChannel?.permissionsFor(guildOrChannel.client.user.id) ?? null;
    }

    return !!permissions?.has(requiredPermissions);
}
