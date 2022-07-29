import { ApplicationCommandBuilder } from '../registerApplicationCommands';
import { ApplicationCommandData, PermissionsBitField } from 'discord.js';
import { RecipleModule, RecipleScript } from '../modules';
import { RecipleClient } from '../classes/RecipleClient';
import { Config } from '../classes/RecipleConfig';
import { CommandBuilder } from './builders';

export interface RecipleClientAddModuleOptions {
    /**
     * The Module script
     */
    script: RecipleScript;
    /**
     * Register application commands if possible
     */
    registerApplicationCommands?: boolean;
    /**
     * Module optional info
     */
    moduleInfo?: RecipleModule["info"];
}

export interface RegisterApplicationCommandsOptions {
    /**
     * Bot client
     */
    client: RecipleClient;
    /**
     * Commands to register
     */
    commands: (ApplicationCommandData|ApplicationCommandBuilder)[];
    /**
     * Set guild to not register commands globally
     */
    guilds?: string|string[];
}

export interface UserHasCommandPermissionsOptions {
    builder: CommandBuilder;
    memberPermissions?: PermissionsBitField;
    commandPermissions?: Config["commands"]["slashCommand"]["permissions"]|Config["commands"]["messageCommand"]["permissions"];
}
