import { Permissions } from "discord.js";
import { Config } from "./classes/Config";

export function commandPermissions(commandName: string, member: Permissions|null, permissions?: Config['permissions']['messageCommands']|Config['permissions']['interactionCommands']): boolean {
    if (!permissions?.enabled) return true;

    const command = permissions.commands.find(c => c.command.toLowerCase() === commandName.toLowerCase());
    if (!command) return true;
    if (!command.permissions.length) return true;
    
    return member ? member.has(command.permissions) : false;
}