import { InteractionCommandBuilder } from './classes/builders/InteractionCommandBuilder';
import { RecipleClient } from "./classes/Client";
import { ApplicationCommandData, ApplicationCommandDataResolvable } from 'discord.js';
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

export async function registerInteractionCommands(client: RecipleClient, cmds?: (commandBuilders|ApplicationCommandDataResolvable)[]): Promise<void> {
    const commands = Object.values(cmds ?? client.commands.INTERACTION_COMMANDS).map(c => {
        if (typeof (c as InteractionCommandBuilder).toJSON !== 'undefined') return (c as InteractionCommandBuilder).toJSON();
        return c as ApplicationCommandData;
    }) ?? [];

    if (!commands || !commands.length) {
        client.logger.warn('No interaction commands found.');
        return;
    }

    if (!client.config?.commands.interactionCommand.guilds.length) {
        await client.application?.commands.set(commands).catch(e => client.logger.error(e));
        client.logger.warn('No guilds were specified for interaction commands. Registered commands for all guilds.');
    } else {
        const guilds = typeof client.config.commands.interactionCommand.guilds === 'string' ? [client.config.commands.interactionCommand.guilds] : client.config.commands.interactionCommand.guilds;
        
        client.logger.warn(`Registering ${commands.length} interaction commands for ${guilds.length} guild(s).`);
        for (const guild of guilds) {
            await client.application?.commands.set(commands, guild).catch(e => client.logger.error(e));
            client.logger.warn(`Registered ${commands.length} interaction commands for ${guild}.`);
        }
    }
}