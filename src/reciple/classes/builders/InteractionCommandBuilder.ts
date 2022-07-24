import { RecipleCommandBuilderType } from '../../types/builders';
import { RecipleHaltedCommandData } from '../../types/commands';
import { RecipleClient } from '../RecipleClient';

import { SlashCommandBuilder } from '@discordjs/builders';
import { Awaitable, ChatInputCommandInteraction, PermissionResolvable } from 'discord.js';

/**
 * Execute data for interaction command
 */
export interface InteractionCommandExecuteData {
    interaction: ChatInputCommandInteraction;
    builder: InteractionCommandBuilder;
    client: RecipleClient<true>;
}

/**
 * Reciple builder for interaction/slash command
 */
export class InteractionCommandBuilder extends SlashCommandBuilder {
    public readonly builder = RecipleCommandBuilderType.InteractionCommand;
    public cooldown: number = 0;
    public requiredBotPermissions: PermissionResolvable[] = [];
    public requiredUserPermissions: PermissionResolvable[] = [];
    public allowExecuteInDM: boolean = true;
    public halt?: (haltData: RecipleHaltedCommandData<InteractionCommandBuilder>) => Awaitable<boolean|void>;
    public execute: (executeData: InteractionCommandExecuteData) => Awaitable<void> = () => { /* Execute */ };

    /**
     * Sets the execute cooldown for this command.
     * - `0` means no cooldown
     * @param cooldown Command cooldown in milliseconds
     */
    public setCooldown(cooldown: number): InteractionCommandBuilder {
        this.cooldown = cooldown;
        return this;
    }

    /**
     * Set required bot permissions to execute the command
     * @param permissions Bot's required permissions
     */
     public setRequiredBotPermissions(...permissions: PermissionResolvable[]): InteractionCommandBuilder {
        this.requiredBotPermissions = permissions;
        return this;
    }

    /**
     * Set required permissions to execute the command
     * @param permissions User's return permissions
     */
    public setRequiredMemberPermissions(...permissions: PermissionResolvable[]): InteractionCommandBuilder {
        this.requiredUserPermissions = permissions;
        return this;
    }

    /**
     * Function when the command is interupted 
     * @param halt Function to execute when command is halted
     */
    public setHalt(halt?: (haltData: RecipleHaltedCommandData<InteractionCommandBuilder>) => Awaitable<boolean|void>): InteractionCommandBuilder {
        this.halt = halt ? halt : undefined;
        return this;
    }

    /**
     * Function when the command is executed 
     * @param execute Function to execute when the command is called 
     */
    public setExecute(execute: (executeData: InteractionCommandExecuteData) => void): InteractionCommandBuilder {
        if (!execute || typeof execute !== 'function') throw new Error('execute must be a function.');
        this.execute = execute;
        return this;
    }
}
