import { CommandInteraction, PermissionResolvable } from 'discord.js';
import { CommandHaltFunction, RecipleClient } from '../RecipleClient';
import { SlashCommandBuilder } from '@discordjs/builders';

export interface RecipleInteractionCommandExecuteData {
    interaction: CommandInteraction;
    command: RecipleInteractionCommandBuilder;
    builder: RecipleInteractionCommandBuilder;
    client: RecipleClient<true>;
}

export class RecipleInteractionCommandBuilder extends SlashCommandBuilder {
    public readonly builder = 'INTERACTION_COMMAND';
    public cooldown: number = 0;
    public requiredBotPermissions: PermissionResolvable[] = [];
    public RequiredUserPermissions: PermissionResolvable[] = [];
    public allowExecuteInDM: boolean = true;
    public halt?: CommandHaltFunction<RecipleInteractionCommandExecuteData>;
    public execute: (options: RecipleInteractionCommandExecuteData) => void = () => { /* Execute */ };

    /**
     * Sets the execute cooldown for this command.
     * - `0` means no cooldown
     */
    public setCooldown(cooldown: number): InteractionCommandBuilder {
        this.cooldown = cooldown;
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
    public setHalt(halt?: CommandHaltFunction<RecipleInteractionCommandExecuteData>): InteractionCommandBuilder {
        this.halt = halt ? halt : undefined;
        return this;
    }

    /**
     * Function when the command is executed 
     */
    public setExecute(execute: (executeData: RecipleInteractionCommandExecuteData) => void): InteractionCommandBuilder {
        if (!execute || typeof execute !== 'function') throw new Error('execute must be a function.');
        this.execute = execute;
        return this;
    }
}
