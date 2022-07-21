import { InteractionCommandBuilder } from './classes/builders/InteractionCommandBuilder';
import { ContextMenuCommandBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { RegisterInteractionCommandsOptions } from './types/paramOptions';
import { ApplicationCommandData } from 'discord.js';


export type InteractionBuilder = ContextMenuCommandBuilder|InteractionCommandBuilder|SlashCommandBuilder;

/**
 * Register interaction commands 
 */
export async function registerInteractionCommands(options: RegisterInteractionCommandsOptions): Promise<void> {
    const client = options.client;
    const guilds = typeof options.guilds == 'string' ? [options.guilds] : options.guilds;

    const commands = Object.values(options.commands ?? client.commands.interactionCommands).map(cmd => {
        if (typeof (cmd as InteractionBuilder)?.toJSON == 'undefined') return cmd as ApplicationCommandData;

        cmd = cmd as InteractionBuilder;

        if (cmd instanceof InteractionCommandBuilder && client.config.commands.interactionCommand.setRequiredPermissions) {
            const permissions = (
                    client.config.commands.interactionCommand.permissions.enabled ?
                    client.config.commands.interactionCommand.permissions.commands.find(cmd_ => cmd_.command.toLowerCase() === cmd.name.toLowerCase())?.permissions :
                    undefined
                ) ?? cmd.requiredBotPermissions;

            cmd.setRequiredMemberPermissions(permissions);
            client.commands.interactionCommands[cmd.name] = cmd;

            if (client.isClientLogsEnabled()) client.logger.debug(`Set required permissions for ${cmd.name}`);
            return cmd.toJSON();
        }

        return cmd.toJSON();
    }) ?? [];

    if (!client.isReady()) throw new Error('Client is not ready');
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
