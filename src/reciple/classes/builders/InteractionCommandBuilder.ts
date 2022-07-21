import { Awaitable, ChatInputCommandInteraction, PermissionResolvable } from 'discord.js';
import { RecipleHaltedCommandData } from '../../types/commands';
import { SlashCommandBuilder } from '@discordjs/builders';
import { RecipleClient } from '../RecipleClient';
import { RecipleCommandBuilderType } from '../../types/builders';

export interface RecipleInteractionCommandExecuteData {
    interaction: ChatInputCommandInteraction;
    builder: InteractionCommandBuilder;
    client: RecipleClient<true>;
}

export class InteractionCommandBuilder extends SlashCommandBuilder {
    public readonly builder = RecipleCommandBuilderType.InteractionCommand;
    public cooldown: number = 0;
    public requiredBotPermissions: PermissionResolvable[] = [];
    public RequiredUserPermissions: PermissionResolvable[] = [];
    public allowExecuteInDM: boolean = true;
    public halt?: (haltData: RecipleHaltedCommandData<InteractionCommandBuilder>) => Awaitable<boolean|void>;
    public execute: (executeData: RecipleInteractionCommandExecuteData) => Awaitable<void> = () => { /* Execute */ };

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
    public setHalt(halt?: (haltData: RecipleHaltedCommandData<InteractionCommandBuilder>) => Awaitable<boolean|void>): InteractionCommandBuilder {
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
