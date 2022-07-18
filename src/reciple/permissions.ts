import { Guild, PermissionResolvable, PermissionsBitField } from 'discord.js';
import { RecipleCommandBuilders } from './types/builders';
import { Config } from './classes/RecipleConfig';

/**
 * Check if the user has permissions to execute the given command name
 */
export function userHasCommandPermissions(commandName: string, memberPermissions?: PermissionsBitField, configConmmandPermissions?: Config['permissions']['messageCommands']|Config['permissions']['interactionCommands'], builder?: RecipleCommandBuilders): boolean {
    if (!configConmmandPermissions?.enabled) return true;

    const command = configConmmandPermissions.commands.find(c => c.command.toLowerCase() === commandName.toLowerCase()) ?? { permissions: builder?.RequiredUserPermissions ?? [] };
    if (!command.permissions.length) return true;
    
    return memberPermissions ? memberPermissions.has(command.permissions) : false;
}

export function botHasExecutePermissions(guild?: Guild, requiredPermissions?: PermissionResolvable[]): boolean {
    if (!requiredPermissions?.length) return true;

    return guild?.members.me ? guild.members.me?.permissions.has(requiredPermissions) : false;
}
