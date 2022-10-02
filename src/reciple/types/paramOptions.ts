import { ApplicationCommandBuilder } from '../registerApplicationCommands.js';
import { ApplicationCommandData, PermissionsBitField } from 'discord.js';
import { RecipleModule, RecipleScript } from '../modules.js';
import { RecipleClient } from '../classes/RecipleClient.js';
import { Config } from '../classes/RecipleConfig.js';
import { AnyCommandBuilder } from './builders.js';

export interface RecipleClientAddModuleOptions {
    /**
     * The module script
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
    builder: AnyCommandBuilder;
    memberPermissions?: PermissionsBitField;
    commandPermissions?: Config["commands"]["slashCommand"]["permissions"]|Config["commands"]["messageCommand"]["permissions"];
}
