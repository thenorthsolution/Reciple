import { CommandInteraction, PermissionResolvable } from 'discord.js';
import { CommandHaltEvents, CommandHaltFunction, RecipleClient } from '../RecipleClient';
import { SlashCommandBuilder } from '@discordjs/builders';

export interface RecipleInteractionCommandExecute {
    interaction: CommandInteraction;
    command: InteractionCommandBuilder;
    builder: InteractionCommandBuilder;
    client: RecipleClient<true>;
}

export class InteractionCommandBuilder extends SlashCommandBuilder {
    public readonly builder = 'INTERACTION_COMMAND';
    public cooldown: number = 0;
    public requiredBotPermissions: PermissionResolvable[] = [];
    public RequiredUserPermissions: PermissionResolvable[] = [];
    public allowExecuteInDM: boolean = true;
    public halt?: CommandHaltFunction;
    public execute: (options: RecipleInteractionCommandExecute) => void = () => { /* Execute */ };

    /**
     * Set required permissions to execute the command
     * @deprecated Use method `setRequiredMemberPermissions` instead
     */
    public setRequiredPermissions(permissions: PermissionResolvable[]): InteractionCommandBuilder {
        if (!permissions || !Array.isArray(permissions)) throw new TypeError('Invalid permissions parameter value.');
        this.RequiredUserPermissions = permissions;
        return this;
    }

    /**
     * Set required permissions to execute the command
     */
    public setRequiredMemberPermissions(...permissions: PermissionResolvable[]): InteractionCommandBuilder {
        this.RequiredUserPermissions = permissions;
        return this;
    }

    /**
     * Function when the command is interupted before execution 
     */
    public setHalt(halt?: CommandHaltFunction): InteractionCommandBuilder {
        this.halt = halt ? halt : undefined;
        return this;
    }

    /**
     * Function when the command is executed 
     */
    public setExecute(execute: (options: RecipleInteractionCommandExecute) => void): InteractionCommandBuilder {
        if (!execute || typeof execute !== 'function') throw new Error('execute must be a function.');
        this.execute = execute;
        return this;
    }
}
