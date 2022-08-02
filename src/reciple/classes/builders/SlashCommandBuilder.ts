import { CommandBuilderType, AnyCommandExecuteData, AnyCommandExecuteFunction, AnyCommandHaltFunction } from '../../types/builders';
import { AnyCommandHaltData } from '../../types/commands';
import { RecipleClient } from '../RecipleClient';

import {
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
 * Slash command halt data
 */
export type SlashCommandHaltData = AnyCommandHaltData<CommandBuilderType.SlashCommand>;

/**
 * Slash command halt function
 */
export type SlashCommandHaltFunction = AnyCommandHaltFunction<CommandBuilderType.SlashCommand>;

/**
 * Slash command execute function
 */
export type SlashCommandExecuteFunction = AnyCommandExecuteFunction<CommandBuilderType.SlashCommand>;

/**
 * Reciple builder for interaction/slash command
 */
export class SlashCommandBuilder extends DiscordJsSlashCommandBuilder {
    public readonly type = CommandBuilderType.SlashCommand;
    public cooldown: number = 0;
    public requiredBotPermissions: PermissionResolvable[] = [];
    public requiredMemberPermissions: PermissionResolvable[] = [];
    public allowExecuteInDM: boolean = true;
    public halt?: SlashCommandHaltFunction;
    public execute: SlashCommandExecuteFunction = () => { /* Execute */ };

    /**
     * Sets the execute cooldown for this command.
     * - `0` means no cooldown
     * @param cooldown Command cooldown in milliseconds
     */
    public setCooldown(cooldown: number): this {
        this.cooldown = cooldown;
        return this;
    }

    /**
     * Set required bot permissions to execute the command
     * @param permissions Bot's required permissions
     */
     public setRequiredBotPermissions(...permissions: PermissionResolvable[]): this {
        this.requiredBotPermissions = permissions;
        return this;
    }

    /**
     * Set required permissions to execute the command
     * @param permissions User's return permissions
     */
    public setRequiredMemberPermissions(...permissions: PermissionResolvable[]): this {
        this.requiredMemberPermissions = permissions;
        return this;
    }

    /**
     * Function when the command is interupted 
     * @param halt Function to execute when command is halted
     */
    public setHalt(halt?: this["halt"]): this {
        this.halt = halt ? halt : undefined;
        return this;
    }

    /**
     * Function when the command is executed 
     * @param execute Function to execute when the command is called 
     */
    public setExecute(execute: this["execute"]): this {
        if (!execute || typeof execute !== 'function') throw new Error('execute must be a function.');
        this.execute = execute;
        return this;
    }

    /**
     * Is a slash command builder
     */
    public static isSlashCommandBuilder(builder: any): builder is SlashCommandBuilder {
        return builder instanceof SlashCommandBuilder;
    }

    /**
     * Is a slash command execute data 
     */
    public static isSlashCommandExecuteData(executeData: AnyCommandExecuteData): executeData is SlashCommandExecuteData {
        return (executeData as SlashCommandExecuteData).builder !== undefined && this.isSlashCommandBuilder((executeData as SlashCommandExecuteData).builder);
    }
}
