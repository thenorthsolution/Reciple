import { PermissionResolvable, Permissions } from 'discord.js';
import { recipleCommandBuilders } from './modules';
import { Config } from './classes/Config';


export function hasPermissions(commandName: string, memberPermissions?: Permissions, configConmmandPermissions?: Config['permissions']['messageCommands']|Config['permissions']['interactionCommands'], builder?: recipleCommandBuilders): boolean {
    if (!configConmmandPermissions?.enabled) return true;

    const command = configConmmandPermissions.commands.find(c => c.command.toLowerCase() === commandName.toLowerCase()) ?? { permissions: builder?.requiredPermissions ?? [] };
    if (!command.permissions.length) return true;
    
    return memberPermissions ? memberPermissions.has(command.permissions as PermissionResolvable[]) : false;
}
