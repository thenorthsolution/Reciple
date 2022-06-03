import { InteractionCommandBuilder } from './classes/builders/InteractionCommandBuilder';
import { RecipleClient } from "./classes/Client";
import { ApplicationCommandDataResolvable, GuildResolvable, PermissionString } from 'discord.js';
import {
    ContextMenuCommandBuilder,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandOptionsOnlyBuilder,
    SlashCommandSubcommandGroupBuilder,
    SlashCommandSubcommandsOnlyBuilder
} from '@discordjs/builders';

export type commandBuilders = InteractionCommandBuilder|ContextMenuCommandBuilder|
    SlashCommandBuilder|SlashCommandSubcommandBuilder|
    SlashCommandOptionsOnlyBuilder|SlashCommandSubcommandGroupBuilder|
    SlashCommandSubcommandsOnlyBuilder;

export async function registerInteractionCommands(client: RecipleClient, cmds?: (commandBuilders|ApplicationCommandDataResolvable)[], overwriteGuilds?: GuildResolvable|GuildResolvable[]): Promise<void> {
    let commands = Object.values(cmds ?? client.commands.INTERACTION_COMMANDS).map(c => {
        if (typeof (c as InteractionCommandBuilder).toJSON !== 'undefined') {
            const cmd: InteractionCommandBuilder = c as InteractionCommandBuilder;

            if (cmd?.builder === 'INTERACTION_COMMAND' && client.config?.commands.interactionCommand.setRequiredPermissions) {
                const permissions = (client.config?.permissions?.interactionCommands.enabled ?
                    client.config?.permissions?.interactionCommands.commands.find(cmd_ => cmd_.command.toLowerCase() === cmd.name.toLowerCase())?.permissions :
                    undefined) ?? cmd.requiredPermissions;

                cmd.setRequiredPermissions(permissions as PermissionString[]);
                client.commands.INTERACTION_COMMANDS[cmd.name] = cmd;

                client.logger.debug(`Set required permissions for ${cmd.name} to ${permissions.join(', ')}`);
                return cmd.toJSON() as ApplicationCommandDataResolvable;
            }

            return (c as InteractionCommandBuilder).toJSON() as ApplicationCommandDataResolvable;
        }
        return c as ApplicationCommandDataResolvable;
    }) ?? [];

    if (!commands || !commands.length) {
        client.logger.warn('No interaction commands found.');
        return;
    }

    const configGuilds = overwriteGuilds ?? client.config?.commands.interactionCommand.guilds;
    const guilds: (string|undefined)[] = typeof configGuilds === 'object' ? (configGuilds as string[]) : [configGuilds];

    if (!guilds || !guilds?.length) {
        await client.application?.commands.set(commands)?.catch(e => client.logger.error(e));
        client.logger.warn('No guilds were specified for interaction commands. Registered commands for all guilds.');
    } else {        
        client.logger.warn(`Registering ${commands.length} interaction commands for ${guilds.length} guild(s).`);
        for (const guild of guilds) {
            if (!guild) continue;

            await client.application?.commands.set(commands, guild)?.catch(e => client.logger.error(e));
            client.logger.warn(`Registered ${commands.length} interaction commands for ${guild}.`);
        }
    }
}
