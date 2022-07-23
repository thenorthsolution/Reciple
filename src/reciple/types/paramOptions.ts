import { RecipleClient } from '../classes/RecipleClient';
import { RecipleModule, RecipleScript } from '../modules';
import { InteractionBuilder } from '../registerInteractionCommands';

import { ApplicationCommandData } from 'discord.js';

export interface AddModuleOptions {
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

export interface RegisterInteractionCommandsOptions {
    /**
     * Bot client
     */
    client: RecipleClient;
    /**
     * Commands to register
     */
    commands: (ApplicationCommandData|InteractionBuilder)[];
    /**
     * Set guild to not register commands globally
     */
    guilds?: string|string[];
}
