import { RecipleClient } from "./classes/Client";

export async function registerInteractionCommands(client: RecipleClient): Promise<void> {
    const commands = Object.values(client.commands.INTERACTION_COMMANDS).map(c => c.toJSON());

    if (!commands.length) {
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