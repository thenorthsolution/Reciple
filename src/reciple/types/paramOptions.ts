import { RecipleClient } from '../classes/RecipleClient';
import { Config } from '../classes/RecipleConfig';
import { RecipleModule, RecipleScript } from '../modules';
import { ApplicationCommandBuilder } from '../registerInteractionCommands';
import { RecipleCommandBuilder } from './builders';

import { ApplicationCommandData, PermissionsBitField } from 'discord.js';

export interface RecipleAddModuleOptions {
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

export interface RecipleRegisterApplicationCommandsOptions {
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

export interface RecipleUserHasCommandPermissionsOptions {
    builder: RecipleCommandBuilder;
    memberPermissions?: PermissionsBitField;
    commandPermissions?: Config["commands"]["slashCommand"]["permissions"]|Config["commands"]["messageCommand"]["permissions"];
}
