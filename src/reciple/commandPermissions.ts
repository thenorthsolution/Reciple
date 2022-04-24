import { Permissions } from "discord.js";
import { InteractionCommandBuilder } from './classes/builders/InteractionCommandBuilder';
import { MessageCommandBuilder } from './classes/builders/MessageCommandBuilder';
import { Config } from "./classes/Config";

export function commandPermissions(commandName: string, memberPermissions?: Permissions, configConmmandPermissions?: Config['permissions']['messageCommands']|Config['permissions']['interactionCommands'], builder?: InteractionCommandBuilder|MessageCommandBuilder): boolean {
    if (!configConmmandPermissions?.enabled) return true;

    const command = configConmmandPermissions.commands.find(c => c.command.toLowerCase() === commandName.toLowerCase()) ?? { permissions: builder?.requiredPermissions ?? [] };
    
    console.log(command);
    if (!command) return true;
    if (!command.permissions.length) return true;
    
    return memberPermissions ? memberPermissions.has(command.permissions) : false;
}