import { Guild, GuildTextBasedChannel, PermissionResolvable, PermissionsBitField } from 'discord.js';
import { AnyCommandBuilder } from '../types/commands';

export interface UserHasExecutePermissionsOptions {
    builder: AnyCommandBuilder;
    memberPermissions: PermissionsBitField;
}

export function memberHasExecutePermissions(options: UserHasExecutePermissionsOptions): boolean {
    const requiredPermissions = (options.builder.requiredMemberPermissions ?? (options.builder.isContextMenu() || options.builder.isSlashCommand() ? options.builder.default_member_permissions : undefined)) || undefined;
    if (typeof requiredPermissions !== 'bigint') return true;

    return options.memberPermissions.has(requiredPermissions);
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
