import { Permissions } from "discord.js";
import { Config } from "./classes/Config";

export function commandPermissions(commandName: string, memberPermissions: Permissions|null, configConmmandPermissions?: Config['permissions']['messageCommands']|Config['permissions']['interactionCommands']): boolean {
    if (!configConmmandPermissions?.enabled) return true;

    const command = configConmmandPermissions.commands.find(c => c.command.toLowerCase() === commandName.toLowerCase());
    if (!command) return true;
    if (!command.permissions.length) return true;
    
    return memberPermissions ? memberPermissions.has(command.permissions) : false;
}