import { ApplicationCommandOptionAllowedChannelTypes, ApplicationCommandOptionType, Awaitable, LocalizationMap, PermissionResolvable, RestOrArray, SlashCommandAttachmentOption, SlashCommandBooleanOption, SlashCommandChannelOption, SlashCommandIntegerOption, SlashCommandMentionableOption, SlashCommandNumberOption, SlashCommandRoleOption, SlashCommandStringOption, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandUserOption } from 'discord.js';
import { SlashCommandBuilder, SlashCommandExecuteData, SlashCommandExecuteFunction, SlashCommandHaltData, SlashCommandHaltFunction, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from '../classes/builders/SlashCommandBuilder';
import { MessageCommandBuilder, MessageCommandExecuteData, MessageCommandExecuteFunction, MessageCommandHaltData, MessageCommandHaltFunction } from '../classes/builders/MessageCommandBuilder';
import { MessageCommandOptionBuilder } from '../classes/builders/MessageCommandOptionBuilder';

/**
 * Any command builders
 */
export type AnyCommandBuilder = AnySlashCommandBuilder|MessageCommandBuilder;

/**
 * Any command data
 */
export type AnyCommandData = SlashCommandData|MessageCommandData;

/**
 * Any slash command builders
 */
export type AnySlashCommandBuilder = SlashCommandBuilder|SlashCommandOptionsOnlyBuilder|SlashCommandSubcommandsOnlyBuilder;

/**
 * Any command halt functions
 */
export type AnyCommandHaltFunction = SlashCommandHaltFunction|MessageCommandHaltFunction;

/**
 * Any command execute function
 */
export type AnyCommandExecuteFunction = SlashCommandExecuteFunction|MessageCommandExecuteFunction;

/**
 * Command halt function
 */
export type CommandHaltFunction<T extends CommandBuilderType> = (haltData: T extends CommandBuilderType.SlashCommand ? SlashCommandHaltData : MessageCommandHaltData) => Awaitable<boolean|null|undefined|void>;

/**
 * Command execute function
 */
export type CommandExecuteFunction<T extends CommandBuilderType> = (executeData: T extends CommandBuilderType.SlashCommand ? SlashCommandExecuteData : MessageCommandExecuteData) => Awaitable<void>;

/**
 * Message command options resolvable
 */
export type MessageCommandOptionResolvable = MessageCommandOptionBuilder|MessageCommandOptionData;

/**
 * Slash command options
 */
export type AnySlashCommandOptionData = AnySlashCommandOptionsOnlyOptionData|SlashCommandSubCommandGroupData|SlashCommandSubCommandData;

/**
 * Slash command options builders
 */
export type AnySlashCommandOptionBuilder = AnySlashCommandOptionsOnlyOptionBuilder|SlashCommandSubcommandGroupBuilder|SlashCommandSubcommandBuilder;

/**
 * Slash command options without sub commands
 */
export type AnySlashCommandOptionsOnlyOptionData = SlashCommandStringOptionData|SlashCommandNumberOptionData|SlashCommandIntegerOptionData|
    SlashCommandBooleanOptionData|SlashCommandMentionableOptionData|SlashCommandRoleOptionData|
    SlashCommandUserOptionData|SlashCommandAttachmentOptionData|SlashCommandChannelOptionData;

/**
 * Slash command option builder without sub commands
 */
 export type AnySlashCommandOptionsOnlyOptionBuilder = SlashCommandStringOption|SlashCommandNumberOption|SlashCommandIntegerOption|
    SlashCommandBooleanOption|SlashCommandMentionableOption|SlashCommandRoleOption|
    SlashCommandUserOption|SlashCommandAttachmentOption|SlashCommandChannelOption;

/**
 * Types of command builders
 */
export enum CommandBuilderType {
    MessageCommand,
    SlashCommand
}


/**
 * Shared command builder methods and properties
 */
export interface SharedCommandBuilderProperties {
    readonly type: CommandBuilderType;
    cooldown: number;
    requiredBotPermissions: PermissionResolvable[];
    requiredMemberPermissions: PermissionResolvable[];
    halt?: AnyCommandHaltFunction;
    execute: AnyCommandExecuteFunction;

    /**
     * Sets the execute cooldown for this command.
     * - `0` means no cooldown
     * @param cooldown Command cooldown in milliseconds
     */
    setCooldown(cooldown: number): this;

    /**
     * Set required bot permissions to execute the command
     * @param permissions Bot's required permissions
     */
    setRequiredBotPermissions(...permissions: RestOrArray<PermissionResolvable>): this;

    /**
     * Set required permissions to execute the command
     * @param permissions User's return permissions
     */
    setRequiredMemberPermissions(...permissions: RestOrArray<PermissionResolvable>): this;

    /**
     * Function when the command is interupted 
     * @param halt Function to execute when command is halted
     */
    setHalt(halt?: this["halt"]): this;

    /**
     * Function when the command is executed 
     * @param execute Function to execute when the command is called 
     */
    setExecute(execute: this["execute"]): this;
}

/**
 * Shared command name and description properties
 */
export interface SharedCommandDataProperties {
    name: string;
    description: string;
}

/**
 * Slash command object data interface
 */
export interface SlashCommandData extends SharedCommandDataProperties,Partial<Omit<SharedCommandBuilderProperties, "setCooldown"|"setRequiredBotPermissions"|"setRequiredMemberPermissions"|"setHalt"|"setExecute"|"halt"|"execute">> {
    type: CommandBuilderType.SlashCommand;
    nameLocalizations?: LocalizationMap;
    descriptionLocalizations?: LocalizationMap;
    options?: (AnySlashCommandOptionData|AnySlashCommandOptionBuilder)[];
    /**
     * @deprecated This property is deprecated and will be removed in the future.
     */
    defaultPermission?: boolean;
    defaultMemberPermissions?: string|null;
    dmPermission?: boolean;
    halt?: SlashCommandHaltFunction;
    execute: SlashCommandExecuteFunction;
}

export interface SharedSlashCommandOptionData<V = string|number> extends SharedCommandDataProperties,Pick<SlashCommandData, "nameLocalizations"|"descriptionLocalizations"> {
    choices?: {
        name: string;
        nameLocalizations?: LocalizationMap;
        value: V;
    }[];
    autocomplete?: boolean;
    required?: boolean;
}

export interface SlashCommandAttachmentOptionData extends Omit<SharedSlashCommandOptionData, "choices"|"autocomplete"> {
    type: ApplicationCommandOptionType.Attachment;
}

export interface SlashCommandBooleanOptionData extends Omit<SharedSlashCommandOptionData, "choices"|"autocomplete"> {
    type: ApplicationCommandOptionType.Boolean;
}

export interface SlashCommandChannelOptionData extends Omit<SharedSlashCommandOptionData, "choices"|"autocomplete"> {
    type: ApplicationCommandOptionType.Channel;
    channelTypes?: ApplicationCommandOptionAllowedChannelTypes[];
}

export interface SlashCommandIntegerOptionData extends SharedSlashCommandOptionData<number> {
    type: ApplicationCommandOptionType.Integer;
    minValue?: number;
    maxValue?: number;
}

export interface SlashCommandMentionableOptionData extends Omit<SharedSlashCommandOptionData, "choices"|"autocomplete"> {
    type: ApplicationCommandOptionType.Mentionable;
}

export interface SlashCommandNumberOptionData extends SharedSlashCommandOptionData<number> {
    type: ApplicationCommandOptionType.Number;
    minValue?: number;
    maxValue?: number;
}

export interface SlashCommandRoleOptionData extends Omit<SharedSlashCommandOptionData, "choices"|"autocomplete"> {
    type: ApplicationCommandOptionType.Role;
}

export interface SlashCommandStringOptionData extends SharedSlashCommandOptionData<string> {
    type: ApplicationCommandOptionType.String;
    minLength?: number;
    maxLength?: number;
}

export interface SlashCommandUserOptionData extends Omit<SharedSlashCommandOptionData, "choices"|"autocomplete"> {
    type: ApplicationCommandOptionType.User;
}

export interface SlashCommandSubCommandData extends SharedCommandDataProperties, Pick<SlashCommandData, "nameLocalizations"|"descriptionLocalizations"> {
    type: ApplicationCommandOptionType.Subcommand;
    options: (AnySlashCommandOptionsOnlyOptionData|AnySlashCommandOptionsOnlyOptionBuilder)[];
}

export interface SlashCommandSubCommandGroupData extends SharedCommandDataProperties, Pick<SlashCommandData, "nameLocalizations"|"descriptionLocalizations"> {
    type: ApplicationCommandOptionType.SubcommandGroup;
    options: (SlashCommandSubCommandData|SlashCommandSubcommandBuilder)[];
}

/**
 * Message command object data interface
 */
export interface MessageCommandData extends SharedCommandDataProperties,Partial<Omit<SharedCommandBuilderProperties, "setCooldown"|"setRequiredBotPermissions"|"setRequiredMemberPermissions"|"setHalt"|"setExecute"|"halt"|"execute">> {
    type: CommandBuilderType.MessageCommand;
    aliases?: string[];
    validateOptions?: boolean;
    allowExecuteInDM?: boolean;
    allowExecuteByBots?: boolean;
    halt?: MessageCommandHaltFunction;
    execute: MessageCommandExecuteFunction;
    options?: MessageCommandOptionResolvable[];
}

/**
 * Message command option object data interface
 */
export interface MessageCommandOptionData extends SharedCommandDataProperties {
    required?: boolean;
    validator?: (value: string) => Awaitable<boolean>;
}
