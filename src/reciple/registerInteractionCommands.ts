import { InteractionCommandBuilder } from './classes/builders/InteractionCommandBuilder';
import { ApplicationCommandDataResolvable, PermissionsString } from 'discord.js';
import { RecipleClient } from './classes/RecipleClient';
import {
    ContextMenuCommandBuilder,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandOptionsOnlyBuilder,
    SlashCommandSubcommandGroupBuilder,
    SlashCommandSubcommandsOnlyBuilder
} from '@discordjs/builders';
import { RecipleCommandBuilderTypes } from './types/builders';


export type InteractionBuilder = InteractionCommandBuilder|ContextMenuCommandBuilder|
    SlashCommandBuilder|SlashCommandSubcommandBuilder|
    SlashCommandOptionsOnlyBuilder|SlashCommandSubcommandGroupBuilder|
    SlashCommandSubcommandsOnlyBuilder;

/**
 * Register interaction commands 
 */
export async function registerInteractionCommands(client: RecipleClient, cmds?: (InteractionBuilder|ApplicationCommandDataResolvable)[], overwriteGuilds?: string|string[]): Promise<void> {
    const commands = Object.values(cmds ?? client.commands.interactionCommands).map(c => {
        if (typeof (c as InteractionCommandBuilder).toJSON == 'undefined') return c as ApplicationCommandDataResolvable;
        
        const cmd = c as InteractionCommandBuilder;

        if (cmd?.builder === RecipleCommandBuilderTypes.InteractionCommand && client.config.commands.interactionCommand.setRequiredPermissions) {
            const permissions = (
                    client.config.permissions?.interactionCommands.enabled ?
                    client.config.permissions?.interactionCommands.commands.find(cmd_ => cmd_.command.toLowerCase() === cmd.name.toLowerCase())?.permissions :
                    undefined
                ) ?? cmd.requiredBotPermissions;

            cmd.setRequiredMemberPermissions(permissions as PermissionsString[]);
            client.commands.interactionCommands[cmd.name] = cmd;

            if (client.isClientLogsEnabled()) client.logger.debug(`Set required permissions for ${cmd.name}`);
            return cmd.toJSON() as ApplicationCommandDataResolvable;
        }

        return (c as InteractionCommandBuilder).toJSON() as ApplicationCommandDataResolvable;
    }) ?? [];

    const configGuilds = overwriteGuilds ?? client.config.commands.interactionCommand.guilds;
    const guilds = typeof configGuilds === 'object' ? configGuilds : [configGuilds];

    if (!guilds || !guilds?.length) {
        client.application?.commands.set(commands).then(() => {
            if (client.isClientLogsEnabled()) client.logger.warn('No guilds were specified for interaction commands. Registered interaction commands globally.');
        });
    } else {        
        if (client.isClientLogsEnabled()) client.logger.warn(`Registering ${commands.length} interaction commands to ${guilds.length} guild(s).`);
        
        for (const guild of guilds) {
            if (!guild) continue;

            client.application?.commands.set(commands, guild).then(() => {
                if (client.isClientLogsEnabled()) client.logger.warn(`Registered ${commands.length} interaction command(s) for ${guild}.`);
            });
        }
    }
}
