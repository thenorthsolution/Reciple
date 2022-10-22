import { ApplicationCommand, ApplicationCommandData, ContextMenuCommandBuilder, GuildResolvable, normalizeArray, RestOrArray, RESTPostAPIApplicationCommandsJSONBody, SlashCommandBuilder as DiscordJsSlashCommandBuilder } from 'discord.js';
import { SlashCommandBuilder } from '../builders/SlashCommandBuilder';
import { AnySlashCommandBuilder } from '../../types/builders';
import { RecipleClient } from '../RecipleClient';

export type ApplicationCommandBuilder = AnySlashCommandBuilder | ContextMenuCommandBuilder | DiscordJsSlashCommandBuilder;

export class ApplicationCommandManager {
    readonly client: RecipleClient;

    constructor(client: RecipleClient) {
        this.client = client;
    }

    /**
     * Sets application commands globally or in guilds
     * @param commands Application commands
     * @param guilds set only to guilds
     */
    public async set(commands: (ApplicationCommandBuilder | ApplicationCommandData)[], ...guilds: RestOrArray<GuildResolvable>): Promise<void> {
        guilds = normalizeArray(guilds);

        if (!this.client.isReady()) throw new Error('Client is not ready');
        if (guilds && guilds.length > 1) {
            for (const guild of guilds) {
                await this.set(commands, guild);
            }

            return;
        }

        let guild = guilds?.shift();
        guild = guild ? this.client.guilds.resolveId(guild) || undefined : undefined;

        if (!guild) {
            await this.client.application.commands.set(commands);
            if (!this.client.isClientLogsSilent) this.client.logger.log(`Registered ${this.client.commands.applicationCommandsSize} application command(s) globally...`);
        } else {
            await this.client.application.commands.set(commands, guild);
            if (!this.client.isClientLogsSilent) this.client.logger.log(`Registered ${this.client.commands.applicationCommandsSize} application command(s) to guild ${guild}`);
        }
    }

    /**
     * Add command globally or in guilds
     * @param command Application command
     * @param guilds add only in guilds
     */
    public async add(command: ApplicationCommandBuilder | ApplicationCommandData, ...guilds: RestOrArray<GuildResolvable>): Promise<void> {
        guilds = normalizeArray(guilds);

        if (!this.client.isReady()) throw new Error('Client is not ready');
        if (!command) throw new Error('Command is undefined');
        if (guilds && guilds.length > 1) {
            for (const guild of guilds) {
                await this.add(command, guild);
            }

            return;
        }

        let guild = guilds?.shift();
        guild = guild ? this.client.guilds.resolveId(guild) || undefined : undefined;

        if (!guild) {
            await this.client.application.commands.create(command);
            if (!this.client.isClientLogsSilent) this.client.logger.log(`Created application command '${command.name}' globally`);
        } else {
            await this.client.application.commands.create(command, guild);
            if (!this.client.isClientLogsSilent) this.client.logger.log(`Created application command '${command.name}' to guild ${guild}`);
        }
    }

    /**
     * Remove application command globally or in guilds
     * @param command id of application commmand or ApplicationCommand class
     * @param guilds Remove from guilds
     */
    public async remove(command: string | ApplicationCommand, ...guilds: RestOrArray<GuildResolvable>): Promise<void> {
        guilds = normalizeArray(guilds);

        if (!this.client.isReady()) throw new Error('Client is not ready');
        if (!command) throw new Error('Command is undefined');
        if (guilds && guilds.length > 1) {
            for (const guild of guilds) {
                await this.remove(command, guild);
            }

            return;
        }

        let guild = guilds?.shift();
        guild = guild ? this.client.guilds.resolveId(guild) || undefined : undefined;

        if (!guild) {
            await this.client.application.commands.delete(command);
            if (!this.client.isClientLogsSilent) this.client.logger.log(`Removed application command '${typeof command === 'string' ? command : command.name}' globally`);
        } else {
            await this.client.application.commands.delete(command, guild);
            if (!this.client.isClientLogsSilent) this.client.logger.log(`Removed application command '${typeof command === 'string' ? command : command.name}' from guild ${guild}`);
        }
    }

    /**
     * Edit application command globally or in guilds
     * @param command id of application command or ApplicationCommand class
     * @param newCommand new application command data
     * @param guilds Edit only from guilds
     */
    public async edit(command: string | ApplicationCommand, newCommand: ApplicationCommandBuilder | ApplicationCommandData, ...guilds: RestOrArray<GuildResolvable>): Promise<void> {
        guilds = normalizeArray(guilds);

        if (!this.client.isReady()) throw new Error('Client is not ready');
        if (!command) throw new Error('Command is undefined');
        if (guilds && guilds.length > 1) {
            for (const guild of guilds) {
                await this.edit(command, newCommand, guild);
            }

            return;
        }

        let guild = guilds?.shift();
        guild = guild ? this.client.guilds.resolveId(guild) || undefined : undefined;

        if (!guild) {
            await this.client.application.commands.edit(command, newCommand);
            if (!this.client.isClientLogsSilent) this.client.logger.log(`Removed application command '${typeof command === 'string' ? command : command.name}' globally`);
        } else {
            await this.client.application.commands.edit(command, newCommand, guild);
            if (!this.client.isClientLogsSilent) this.client.logger.log(`Removed application command '${typeof command === 'string' ? command : command.name}' from guild ${guild}`);
        }
    }

    /**
     * Get application command from cache by application command data, builder, id, or name globally or from guid
     * @param command application command data, builder, id, or name
     * @param guild get command from guild
     */
    public get(command: ApplicationCommandData | ApplicationCommandBuilder | string, guild?: GuildResolvable): ApplicationCommand | undefined {
        const commands = guild ? this.client.guilds.resolve(guild)?.commands.cache : this.client.application?.commands.cache;
        if (!commands) throw new Error('Guild not found in cache');

        return commands.find(cmd => (typeof command === 'string' ? cmd.id === command || cmd.name === command : cmd.name === command.name || (command instanceof ApplicationCommand && cmd.id === command.id)));
    }

    /**
     * Fetch application command by id globally or from guild
     * @param commandId command id
     * @param guild fetch from guild
     */
    public async fetch(commandId: string, guild?: GuildResolvable): Promise<ApplicationCommand> {
        const manager = guild ? this.client.guilds.resolve(guild)?.commands : this.client.application?.commands;
        if (!manager) throw new Error('Guild not found in cache');

        return manager.fetch(commandId);
    }

    /**
     * Parse application command builders to command data
     * @param commands Application command builders
     * @param setPermissions set slash commands permissions
     */
    protected parseCommands(commands: (ApplicationCommandData | ApplicationCommandBuilder | RESTPostAPIApplicationCommandsJSONBody)[], setPermissions: boolean = true): (ApplicationCommandData | RESTPostAPIApplicationCommandsJSONBody)[] {
        return commands.map(cmd => {
            if ((cmd as ApplicationCommandBuilder)?.toJSON === undefined) return (<unknown>cmd) as ApplicationCommandData;

            if (SlashCommandBuilder.isSlashCommandBuilder(cmd) && this.client.config.commands.slashCommand.setRequiredPermissions) {
                const permissions = setPermissions || this.client.config.commands.slashCommand.permissions.enabled ? this.client.config.commands.slashCommand.permissions.commands.find(cmd_ => cmd_.command.toLowerCase() === cmd.name.toLowerCase())?.permissions : undefined;

                if (permissions) {
                    cmd.setRequiredMemberPermissions(...permissions);
                    if (!this.client.isClientLogsSilent) this.client.logger.debug(`Set required permissions for ${cmd.name}`);
                }
            }

            return (cmd as ApplicationCommandBuilder).toJSON();
        });
    }
}
