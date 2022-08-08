import { CommandBuilderType, CommandHaltFunction, CommandExecuteFunction, SharedCommandBuilderProperties } from '../../types/builders';
import { AnyCommandExecuteData, BaseCommandExecuteData, CommandHaltData } from '../../types/commands';

import {
    ChatInputCommandInteraction,
    normalizeArray,
    PermissionResolvable,
    RestOrArray,
    SlashCommandBuilder as DiscordJsSlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandSubcommandGroupBuilder,
    SlashCommandSubcommandsOnlyBuilder as DiscordJsSlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

/**
 * Execute data for slash command
 */
export interface SlashCommandExecuteData extends BaseCommandExecuteData {
    interaction: ChatInputCommandInteraction;
    builder: SlashCommandBuilder;
}

/**
 * Slash command halt data
 */
export type SlashCommandHaltData = CommandHaltData<CommandBuilderType.SlashCommand>;

/**
 * Slash command halt function
 */
export type SlashCommandHaltFunction = CommandHaltFunction<CommandBuilderType.SlashCommand>;

/**
 * Slash command execute function
 */
export type SlashCommandExecuteFunction = CommandExecuteFunction<CommandBuilderType.SlashCommand>;

export interface SlashCommandSubcommandsOnlyBuilder extends DiscordJsSlashCommandSubcommandsOnlyBuilder,Pick<SlashCommandBuilder, "setCooldown" | "setRequiredBotPermissions" | "setRequiredMemberPermissions" | "setHalt" | "setExecute"> {}
export interface SlashCommandBuilder extends DiscordJsSlashCommandBuilder {
    addSubcommandGroup(input: SlashCommandSubcommandGroupBuilder | ((subcommandGroup: SlashCommandSubcommandGroupBuilder) => SlashCommandSubcommandGroupBuilder)): SlashCommandSubcommandsOnlyBuilder;
    addSubcommand(input: SlashCommandSubcommandBuilder | ((subcommandGroup: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder)): SlashCommandSubcommandsOnlyBuilder;
}

/**
 * Reciple builder for slash command
 */
export class SlashCommandBuilder extends DiscordJsSlashCommandBuilder implements SharedCommandBuilderProperties,SlashCommandBuilder {
    public readonly type = CommandBuilderType.SlashCommand;
    public cooldown: number = 0;
    public requiredBotPermissions: PermissionResolvable[] = [];
    public requiredMemberPermissions: PermissionResolvable[] = [];
    public allowExecuteInDM: boolean = true;
    public halt?: SlashCommandHaltFunction;
    public execute: SlashCommandExecuteFunction = () => { /* Execute */ };

    public setCooldown(cooldown: number): this {
        this.cooldown = cooldown;
        return this;
    }

    public setRequiredBotPermissions(...permissions: RestOrArray<PermissionResolvable>): this {
        this.requiredBotPermissions = normalizeArray(permissions);
        return this;
    }

    public setRequiredMemberPermissions(...permissions: RestOrArray<PermissionResolvable>): this {
        this.requiredMemberPermissions = normalizeArray(permissions);
        return this;
    }

    public setHalt(halt?: this["halt"]): this {
        this.halt = halt ? halt : undefined;
        return this;
    }

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
