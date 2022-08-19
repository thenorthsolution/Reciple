import { CommandBuilderType, CommandHaltFunction, CommandExecuteFunction, SharedCommandBuilderProperties } from '../../types/builders';
import { BaseCommandExecuteData, CommandHaltData } from '../../types/commands';

import {
    ChatInputCommandInteraction,
    normalizeArray,
    PermissionResolvable,
    RestOrArray,
    SlashCommandBuilder as DiscordJsSlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandSubcommandGroupBuilder,
    SlashCommandSubcommandsOnlyBuilder as DiscordJsSlashCommandSubcommandsOnlyBuilder,
    SlashCommandOptionsOnlyBuilder as DiscordJsSlashCommandOptionsOnlyBuilder,
    SlashCommandBooleanOption,
    SlashCommandUserOption,
    SlashCommandChannelOption,
    SlashCommandRoleOption,
    SlashCommandAttachmentOption,
    SlashCommandMentionableOption,
    SlashCommandStringOption,
    SlashCommandIntegerOption,
    SlashCommandNumberOption
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

export type SlashCommandSubcommandsOnlyBuilder = Omit<SlashCommandBuilder, "addBooleanOption" | "addUserOption" | "addChannelOption" | "addRoleOption" | "addAttachmentOption" | "addMentionableOption" | "addStringOption" | "addIntegerOption" | "addNumberOption">;
export type SlashCommandOptionsOnlyBuilder = Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
export interface SlashCommandBuilder extends DiscordJsSlashCommandBuilder {
    addSubcommandGroup(input: SlashCommandSubcommandGroupBuilder | ((subcommandGroup: SlashCommandSubcommandGroupBuilder) => SlashCommandSubcommandGroupBuilder)): SlashCommandSubcommandsOnlyBuilder;
    addSubcommand(input: SlashCommandSubcommandBuilder | ((subcommandGroup: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder)): SlashCommandSubcommandsOnlyBuilder;
    
    addBooleanOption(input: SlashCommandBooleanOption | ((builder: SlashCommandBooleanOption) => SlashCommandBooleanOption)): Omit<this, "addSubcommand" | "addSubcommandGroup">;
    addUserOption(input: SlashCommandUserOption | ((builder: SlashCommandUserOption) => SlashCommandUserOption)): Omit<this, "addSubcommand" | "addSubcommandGroup">;
    addChannelOption(input: SlashCommandChannelOption | ((builder: SlashCommandChannelOption) => SlashCommandChannelOption)): Omit<this, "addSubcommand" | "addSubcommandGroup">;
    addRoleOption(input: SlashCommandRoleOption | ((builder: SlashCommandRoleOption) => SlashCommandRoleOption)): Omit<this, "addSubcommand" | "addSubcommandGroup">;
    addAttachmentOption(input: SlashCommandAttachmentOption | ((builder: SlashCommandAttachmentOption) => SlashCommandAttachmentOption)): Omit<this, "addSubcommand" | "addSubcommandGroup">;
    addMentionableOption(input: SlashCommandMentionableOption | ((builder: SlashCommandMentionableOption) => SlashCommandMentionableOption)): Omit<this, "addSubcommand" | "addSubcommandGroup">;
    addStringOption(input: SlashCommandStringOption | Omit<SlashCommandStringOption, 'setAutocomplete'> | Omit<SlashCommandStringOption, 'addChoices'> | ((builder: SlashCommandStringOption) => SlashCommandStringOption | Omit<SlashCommandStringOption, 'setAutocomplete'> | Omit<SlashCommandStringOption, 'addChoices'>)): Omit<this, "addSubcommand" | "addSubcommandGroup">;
    addIntegerOption(input: SlashCommandIntegerOption | Omit<SlashCommandIntegerOption, 'setAutocomplete'> | Omit<SlashCommandIntegerOption, 'addChoices'> | ((builder: SlashCommandIntegerOption) => SlashCommandIntegerOption | Omit<SlashCommandIntegerOption, 'setAutocomplete'> | Omit<SlashCommandIntegerOption, 'addChoices'>)): Omit<this, "addSubcommand" | "addSubcommandGroup">;
    addNumberOption(input: SlashCommandNumberOption | Omit<SlashCommandNumberOption, 'setAutocomplete'> | Omit<SlashCommandNumberOption, 'addChoices'> | ((builder: SlashCommandNumberOption) => SlashCommandNumberOption | Omit<SlashCommandNumberOption, 'setAutocomplete'> | Omit<SlashCommandNumberOption, 'addChoices'>)): Omit<this, "addSubcommand" | "addSubcommandGroup">;
}

/**
 * Reciple builder for slash command
 */
export class SlashCommandBuilder extends DiscordJsSlashCommandBuilder implements SharedCommandBuilderProperties {
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

    public setHalt(halt?: SlashCommandHaltFunction|null): this {
        this.halt = halt ?? undefined;
        return this;
    }

    public setExecute(execute: SlashCommandExecuteFunction): this {
        if (!execute || typeof execute !== 'function') throw new Error('execute must be a function.');
        this.execute = execute;
        return this;
    }

    /**
     * Is a slash command builder
     */
    public static isSlashCommandBuilder(builder: unknown): builder is SlashCommandBuilder {
        return builder instanceof SlashCommandBuilder;
    }

    /**
     * Is a slash command execute data 
     */
    public static isSlashCommandExecuteData(executeData: unknown): executeData is SlashCommandExecuteData {
        return (executeData as SlashCommandExecuteData).builder !== undefined && this.isSlashCommandBuilder((executeData as SlashCommandExecuteData).builder);
    }
}
