import { ApplicationCommandData, ContextMenuCommandBuilder, normalizeArray, RestOrArray, SlashCommandBuilder as DiscordJsSlashCommandBuilder } from 'discord.js';
import { SlashCommandBuilder } from './classes/builders/SlashCommandBuilder';
import { RegisterApplicationCommandsOptions } from './types/paramOptions';

export type ApplicationCommandBuilder = SlashCommandBuilder|ContextMenuCommandBuilder|DiscordJsSlashCommandBuilder;

/**
 * Register application commands 
 * @param options Register application commands options
 */
export async function registerApplicationCommands(options: RegisterApplicationCommandsOptions): Promise<void> {
    const client = options.client;
    const guilds = normalizeArray(options.guilds as RestOrArray<string>);

    const commands = Object.values(options.commands ?? client.commands.slashCommands).map(cmd => {
        if (typeof (cmd as ApplicationCommandBuilder)?.toJSON == 'undefined') return cmd as ApplicationCommandData;

        cmd = cmd as ApplicationCommandBuilder;

        if (SlashCommandBuilder.isSlashCommandBuilder(cmd) && client.config.commands.slashCommand.setRequiredPermissions) {
            const permissions = client.config.commands.slashCommand.permissions.enabled
                    ? client.config.commands.slashCommand.permissions.commands.find(cmd_ => cmd_.command.toLowerCase() === cmd.name.toLowerCase())?.permissions
                    : undefined;

            if (permissions) {
                cmd.setRequiredMemberPermissions(...permissions);
                if (client.isClientLogsEnabled()) client.logger.debug(`Set required permissions for ${cmd.name}`);
            }

            client.commands.slashCommands[cmd.name] = cmd;
        }

        return cmd.toJSON();
    }) ?? [];

    if (!client.isReady()) throw new Error('Client is not ready');
    if (!guilds || !guilds?.length) {
        client.application?.commands.set(commands).then(() => {
            if (client.isClientLogsEnabled()) client.logger.warn('No guilds were specified for application commands. Registered application commands globally.');
        });
    } else {        
        if (client.isClientLogsEnabled()) client.logger.warn(`Registering ${commands.length} application commands to ${guilds.length} guild(s).`);
        
        for (const guild of guilds) {
            if (!guild) continue;

            client.application?.commands.set(commands, guild).then(() => {
                if (client.isClientLogsEnabled()) client.logger.warn(`Registered ${commands.length} application command(s) for ${guild}.`);
            });
        }
    }
}
