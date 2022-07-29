import { CommandBuilderType } from '../../types/builders';
import { HaltedCommandData } from '../../types/commands';
import { RecipleClient } from '../RecipleClient';

import {
    Awaitable,
    ChatInputCommandInteraction,
    PermissionResolvable,
    SlashCommandBuilder as DiscordJsSlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandSubcommandGroupBuilder,
    SlashCommandSubcommandsOnlyBuilder as DiscordJsSlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

/**
 * Execute data for interaction command
 */
export interface SlashCommandExecuteData {
    interaction: ChatInputCommandInteraction;
    builder: SlashCommandBuilder;
    client: RecipleClient<true>;
}

export interface SlashCommandSubcommandsOnlyBuilder extends DiscordJsSlashCommandSubcommandsOnlyBuilder,Pick<SlashCommandBuilder, "setCooldown" | "setRequiredBotPermissions" | "setRequiredMemberPermissions" | "setHalt" | "setExecute"> {
}

export interface SlashCommandBuilder extends DiscordJsSlashCommandBuilder {
    addSubcommandGroup(input: SlashCommandSubcommandGroupBuilder | ((subcommandGroup: SlashCommandSubcommandGroupBuilder) => SlashCommandSubcommandGroupBuilder)): SlashCommandSubcommandsOnlyBuilder;
    addSubcommand(input: SlashCommandSubcommandBuilder | ((subcommandGroup: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder)): SlashCommandSubcommandsOnlyBuilder;
}

/**
 * Reciple builder for interaction/slash command
 */
export class SlashCommandBuilder extends DiscordJsSlashCommandBuilder {
    public readonly builder = CommandBuilderType.SlashCommand;
    public cooldown: number = 0;
    public requiredBotPermissions: PermissionResolvable[] = [];
    public requiredMemberPermissions: PermissionResolvable[] = [];
    public allowExecuteInDM: boolean = true;
    public halt?: (haltData: HaltedCommandData<SlashCommandBuilder>) => Awaitable<boolean|void>;
    public execute: (executeData: SlashCommandExecuteData) => Awaitable<void> = () => { /* Execute */ };

    /**
     * Sets the execute cooldown for this command.
     * - `0` means no cooldown
     * @param cooldown Command cooldown in milliseconds
     */
    public setCooldown(cooldown: number): SlashCommandBuilder {
        this.cooldown = cooldown;
        return this;
    }

    /**
     * Set required bot permissions to execute the command
     * @param permissions Bot's required permissions
     */
     public setRequiredBotPermissions(...permissions: PermissionResolvable[]): SlashCommandBuilder {
        this.requiredBotPermissions = permissions;
        return this;
    }

    /**
     * Set required permissions to execute the command
     * @param permissions User's return permissions
     */
    public setRequiredMemberPermissions(...permissions: PermissionResolvable[]): SlashCommandBuilder {
        this.requiredMemberPermissions = permissions;
        return this;
    }

    /**
     * Function when the command is interupted 
     * @param halt Function to execute when command is halted
     */
    public setHalt(halt?: (haltData: HaltedCommandData<SlashCommandBuilder>) => Awaitable<boolean|void>): SlashCommandBuilder {
        this.halt = halt ? halt : undefined;
        return this;
    }

    /**
     * Function when the command is executed 
     * @param execute Function to execute when the command is called 
     */
    public setExecute(execute: (executeData: SlashCommandExecuteData) => void): SlashCommandBuilder {
        if (!execute || typeof execute !== 'function') throw new Error('execute must be a function.');
        this.execute = execute;
        return this;
    }
}
