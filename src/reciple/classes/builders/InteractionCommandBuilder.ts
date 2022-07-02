import { CommandInteraction, PermissionFlags, PermissionString } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { RecipleClient } from '../RecipleClient';


export interface RecipleInteractionCommandExecute {
    interaction: CommandInteraction;
    command: InteractionCommandBuilder;
    builder: InteractionCommandBuilder;
    client: RecipleClient<true>;
}

export class InteractionCommandBuilder extends SlashCommandBuilder {
    public readonly builder = 'INTERACTION_COMMAND';
    public requiredPermissions: (PermissionFlags|PermissionString)[] = [];
    public allowExecuteInDM: boolean = true;
    public execute: (options: RecipleInteractionCommandExecute) => void = () => { /* Execute */ };
    
    /**
     * Set required permissions before executing the command
     */
    public setRequiredPermissions(requiredPermissions: (keyof PermissionFlags)[]): InteractionCommandBuilder {
        if (!requiredPermissions || !Array.isArray(requiredPermissions)) throw new Error('requiredPermissions must be an array.');
        this.requiredPermissions = requiredPermissions;
        return this;
    }

    /**
     * Set if command can be executed in dms
     * @deprecated use `InteractionCommandBuilder.setDMPermission()` instead
     */
    public setAllowExecuteInDM(allowExecuteInDM: boolean): InteractionCommandBuilder {
        // TODO: Deprecated this
        if (typeof allowExecuteInDM !== 'boolean') throw new Error('allowExecuteInDM must be a boolean.');
        this.allowExecuteInDM = allowExecuteInDM;
        process.emitWarning('InteractionCommandBuilder#setAllowExecuteInDM() method is deprecated in favor of setting SlashCommandBuilder#setDMPermission()', 'Deprecation Warning');
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
