import { PermissionResolvable, Permissions } from 'discord.js';
import { recipleCommandBuilders } from './modules';
import { Config } from './classes/RecipleConfig';

/**
 * Check if the user has permissions to execute the given command name
 */
export function hasExecutePermissions(commandName: string, memberPermissions?: Permissions, configConmmandPermissions?: Config['permissions']['messageCommands']|Config['permissions']['interactionCommands'], builder?: recipleCommandBuilders): boolean {
    if (!configConmmandPermissions?.enabled) return true;

    const command = configConmmandPermissions.commands.find(c => c.command.toLowerCase() === commandName.toLowerCase()) ?? { permissions: builder?.RequiredUserPermissions ?? [] };
    if (!command.permissions.length) return true;
    
    return memberPermissions ? memberPermissions.has(command.permissions) : false;
}

export function botHasPermissions() {}
