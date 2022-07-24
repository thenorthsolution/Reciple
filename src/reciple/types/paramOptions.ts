import { RecipleClient } from '../classes/RecipleClient';
import { Config } from '../classes/RecipleConfig';
import { RecipleModule, RecipleScript } from '../modules';
import { InteractionBuilder } from '../registerInteractionCommands';
import { RecipleCommandBuilder } from './builders';

import { ApplicationCommandData, PermissionsBitField } from 'discord.js';

export interface RecipleAddModuleOptions {
    /**
     * The Module script
     */
    script: RecipleScript;
    /**
     * Register interaction commands if possible
     */
    registerInteractionCommands?: boolean;
    /**
     * Module optional info
     */
    moduleInfo?: RecipleModule["info"];
}

export interface RecipleRegisterInteractionCommandsOptions {
    /**
     * Bot client
     */
    client: RecipleClient;
    /**
     * Commands to register
     */
    commands: (ApplicationCommandData|InteractionBuilder)[];
    /**PermissionResolvable
     * Set guild to not register commands globally
     */
    guilds?: string|string[];
}

export interface RecipleUserHasCommandPermissionsOptions {
    builder: RecipleCommandBuilder;
    memberPermissions?: PermissionsBitField;
    commandPermissions?: Config["commands"]["interactionCommand"]["permissions"]|Config["commands"]["messageCommand"]["permissions"];
}
