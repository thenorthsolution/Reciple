import { InteractionCommandBuilder } from './classes/builders/InteractionCommandBuilder';
import { ApplicationCommandDataResolvable, PermissionString } from 'discord.js';
import { RecipleClient } from './classes/RecipleClient';
import {
    ContextMenuCommandBuilder,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandOptionsOnlyBuilder,
    SlashCommandSubcommandGroupBuilder,
    SlashCommandSubcommandsOnlyBuilder
} from '@discordjs/builders';


export type interactionCommandBuilders = InteractionCommandBuilder|ContextMenuCommandBuilder|
    SlashCommandBuilder|SlashCommandSubcommandBuilder|
    SlashCommandOptionsOnlyBuilder|SlashCommandSubcommandGroupBuilder|
    SlashCommandSubcommandsOnlyBuilder;

/**
 * Register interaction commands 
 */
export async function registerInteractionCommands(client: RecipleClient, cmds?: (interactionCommandBuilders|ApplicationCommandDataResolvable)[], overwriteGuilds?: string|string[]): Promise<void> {
    const commands = Object.values(cmds ?? client.commands.INTERACTION_COMMANDS).map(c => {
        if (typeof (c as InteractionCommandBuilder).toJSON == 'undefined') return c as ApplicationCommandDataResolvable;
        
        const cmd = c as InteractionCommandBuilder;

        if (cmd?.builder === 'INTERACTION_COMMAND' && client.config.commands.interactionCommand.setRequiredPermissions) {
            const permissions = (
                    client.config.permissions?.interactionCommands.enabled ?
                    client.config.permissions?.interactionCommands.commands.find(cmd_ => cmd_.command.toLowerCase() === cmd.name.toLowerCase())?.permissions :
                    undefined
                ) ?? cmd.requiredPermissions;

            cmd.setRequiredPermissions(permissions as PermissionString[]);
            client.commands.INTERACTION_COMMANDS[cmd.name] = cmd;

            client.logger.debug(`Set required permissions for ${cmd.name}`);
            return cmd.toJSON() as ApplicationCommandDataResolvable;
        }

        return (c as InteractionCommandBuilder).toJSON() as ApplicationCommandDataResolvable;
    }) ?? [];

    const configGuilds = overwriteGuilds ?? client.config.commands.interactionCommand.guilds;
    const guilds = typeof configGuilds === 'object' ? configGuilds : [configGuilds];

    if (!guilds || !guilds?.length) {
        client.application?.commands.set(commands).then(() => {
            client.logger.warn('No guilds were specified for interaction commands. Registered commands for all guilds.');
        }).catch(e => client.logger.error(e));
    } else {        
        client.logger.warn(`Registering ${commands.length} interaction commands to ${guilds.length} guild(s).`);
        
        for (const guild of guilds) {
            if (!guild) continue;

            client.application?.commands.set(commands, guild).then(() => {
                client.logger.warn(`Registered ${commands.length} interaction command(s) for ${guild}.`);
            }).catch(e => client.logger.error(e));
        }
    }
}
