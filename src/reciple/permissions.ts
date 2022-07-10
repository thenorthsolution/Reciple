import { recipleCommandBuilders } from './modules';
import { Config } from './classes/RecipleConfig';
import { Guild, PermissionResolvable, Permissions } from 'discord.js';

/**
 * Check if the user has permissions to execute the given command name
 */
export function userHasCommandPermissions(commandName: string, memberPermissions?: Permissions, configConmmandPermissions?: Config['permissions']['messageCommands']|Config['permissions']['interactionCommands'], builder?: recipleCommandBuilders): boolean {
    if (!configConmmandPermissions?.enabled) return true;

    const command = configConmmandPermissions.commands.find(c => c.command.toLowerCase() === commandName.toLowerCase()) ?? { permissions: builder?.RequiredUserPermissions ?? [] };
    if (!command.permissions.length) return true;
    
    return memberPermissions ? memberPermissions.has(command.permissions) : false;
}

export function botHasExecutePermissions(guild?: Guild, requiredPermissions?: PermissionResolvable[]): boolean {
    return guild?.me && requiredPermissions ? guild.me?.permissions.has(requiredPermissions) : false;
}
