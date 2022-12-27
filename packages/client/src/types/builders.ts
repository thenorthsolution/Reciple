import { ApplicationCommandOptionAllowedChannelTypes, ApplicationCommandOptionType, Awaitable, LocalizationMap, Message, SlashCommandAttachmentOption, SlashCommandBooleanOption, SlashCommandChannelOption, SlashCommandIntegerOption, SlashCommandMentionableOption, SlashCommandNumberOption, SlashCommandRoleOption, SlashCommandStringOption, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandUserOption } from 'discord.js';
import { BaseCommandBuilder } from '../classes/builders/BaseCommandBuilder';
import { MessageCommandBuilder, MessageCommandExecuteData, MessageCommandExecuteFunction, MessageCommandHaltData, MessageCommandHaltFunction } from '../classes/builders/MessageCommandBuilder';
import { SlashCommandBuilder, SlashCommandExecuteData, SlashCommandExecuteFunction, SlashCommandHaltData, SlashCommandHaltFunction, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from '../classes/builders/SlashCommandBuilder';
import { MessageCommandOptionResolvable } from '../classes/builders/MessageCommandOptionBuilder';

export enum CommandType {
    SlashCommand = 1,
    MessageCommand
}

export type AnySlashCommandBuilder<Metadata = unknown> = SlashCommandBuilder<Metadata>|SlashCommandOptionsOnlyBuilder<Metadata>|SlashCommandSubcommandsOnlyBuilder<Metadata>;

export type AnyCommandData<Metadata = unknown> = SlashCommandData<Metadata>|MessageCommandData<Metadata>;
export type AnyCommandBuilder<Metadata = unknown> = AnySlashCommandBuilder<Metadata>|MessageCommandBuilder<Metadata>;

export type AnyCommandExecuteFunction<Metadata = unknown> = SlashCommandExecuteFunction<Metadata>|MessageCommandExecuteFunction<Metadata>;
export type AnyCommandExecuteData<Metadata = unknown> = SlashCommandExecuteData<Metadata>|MessageCommandExecuteData<Metadata>;

export type AnyCommandHaltFunction<Metadata = unknown> = SlashCommandHaltFunction<Metadata>|MessageCommandHaltFunction<Metadata>;
export type AnyCommandHaltData<Metadata = unknown> = SlashCommandHaltData<Metadata>|MessageCommandHaltData<Metadata>;

export type AnySlashCommandOptionData = AnySlashCommandOptionsOnlyOptionData | SlashCommandSubCommandGroupData | SlashCommandSubCommandData;
export type AnySlashCommandOptionBuilder = AnySlashCommandOptionsOnlyOptionBuilder | SlashCommandSubcommandGroupBuilder | SlashCommandSubcommandBuilder;

export type AnySlashCommandOptionsOnlyOptionData =
    | SlashCommandAttachmentOptionData
    | SlashCommandBooleanOptionData
    | SlashCommandChannelOptionData
    | SlashCommandIntegerOptionData
    | SlashCommandMentionableOptionData
    | SlashCommandNumberOptionData
    | SlashCommandRoleOptionData
    | SlashCommandStringOptionData
    | SlashCommandUserOptionData;

export type AnySlashCommandOptionsOnlyOptionBuilder =
    | SlashCommandAttachmentOption
    | SlashCommandBooleanOption
    | SlashCommandChannelOption
    | SlashCommandIntegerOption
    | SlashCommandMentionableOption
    | SlashCommandNumberOption
    | SlashCommandRoleOption
    | SlashCommandStringOption
    | SlashCommandUserOption;

export interface SharedCommandDataProperties {
    name: string;
    description: string;
}

export interface SlashCommandData<Metadata = unknown> extends SharedCommandDataProperties, Partial<Omit<BaseCommandBuilder<Metadata>, 'setCooldown' | 'setRequiredBotPermissions' | 'setRequiredMemberPermissions' | 'setHalt' | 'setExecute' | 'setMetadata' | 'halt' | 'execute'>> {
    type: CommandType.SlashCommand;
    nameLocalizations?: LocalizationMap;
    descriptionLocalizations?: LocalizationMap;
    options?: (AnySlashCommandOptionData | AnySlashCommandOptionBuilder)[];
    /**
     * @deprecated This property is deprecated and will be removed in the future.
     */
    defaultPermission?: boolean;
    defaultMemberPermissions?: string | null;
    dmPermission?: boolean;
    halt?: SlashCommandHaltFunction<Metadata>;
    execute: SlashCommandExecuteFunction<Metadata>;
}

export interface SharedSlashCommandOptionData<V = string | number> extends SharedCommandDataProperties, Pick<SlashCommandData, 'nameLocalizations' | 'descriptionLocalizations'> {
    choices?: {
        name: string;
        nameLocalizations?: LocalizationMap;
        value: V;
    }[];
    autocomplete?: boolean;
    required?: boolean;
}

export interface SlashCommandAttachmentOptionData extends Omit<SharedSlashCommandOptionData, 'choices' | 'autocomplete'> {
    type: ApplicationCommandOptionType.Attachment;
}

export interface SlashCommandBooleanOptionData extends Omit<SharedSlashCommandOptionData, 'choices' | 'autocomplete'> {
    type: ApplicationCommandOptionType.Boolean;
}

export interface SlashCommandChannelOptionData extends Omit<SharedSlashCommandOptionData, 'choices' | 'autocomplete'> {
    type: ApplicationCommandOptionType.Channel;
    channelTypes?: ApplicationCommandOptionAllowedChannelTypes[];
}

export interface SlashCommandIntegerOptionData extends SharedSlashCommandOptionData<number> {
    type: ApplicationCommandOptionType.Integer;
    minValue?: number;
    maxValue?: number;
}

export interface SlashCommandMentionableOptionData extends Omit<SharedSlashCommandOptionData, 'choices' | 'autocomplete'> {
    type: ApplicationCommandOptionType.Mentionable;
}

export interface SlashCommandNumberOptionData extends SharedSlashCommandOptionData<number> {
    type: ApplicationCommandOptionType.Number;
    minValue?: number;
    maxValue?: number;
}

export interface SlashCommandRoleOptionData extends Omit<SharedSlashCommandOptionData, 'choices' | 'autocomplete'> {
    type: ApplicationCommandOptionType.Role;
}

export interface SlashCommandStringOptionData extends SharedSlashCommandOptionData<string> {
    type: ApplicationCommandOptionType.String;
    minLength?: number;
    maxLength?: number;
}

export interface SlashCommandUserOptionData extends Omit<SharedSlashCommandOptionData, 'choices' | 'autocomplete'> {
    type: ApplicationCommandOptionType.User;
}

export interface SlashCommandSubCommandData extends SharedCommandDataProperties, Pick<SlashCommandData, 'nameLocalizations' | 'descriptionLocalizations'> {
    type: ApplicationCommandOptionType.Subcommand;
    options: (AnySlashCommandOptionsOnlyOptionData | AnySlashCommandOptionsOnlyOptionBuilder)[];
}

export interface SlashCommandSubCommandGroupData extends SharedCommandDataProperties, Pick<SlashCommandData, 'nameLocalizations' | 'descriptionLocalizations'> {
    type: ApplicationCommandOptionType.SubcommandGroup;
    options: (SlashCommandSubCommandData | SlashCommandSubcommandBuilder)[];
}

export interface MessageCommandData<Metadata> extends SharedCommandDataProperties, Partial<Omit<BaseCommandBuilder<Metadata>, 'setCooldown' | 'setRequiredBotPermissions' | 'setRequiredMemberPermissions' | 'setHalt' | 'setExecute' | 'setMetadata' | 'halt' | 'execute'>> {
    type: CommandType.MessageCommand;
    aliases?: string[];
    validateOptions?: boolean;
    allowExecuteInDM?: boolean;
    allowExecuteByBots?: boolean;
    halt?: MessageCommandHaltFunction<Metadata>;
    execute: MessageCommandExecuteFunction<Metadata>;
    options?: MessageCommandOptionResolvable[];
}

export interface MessageCommandOptionData extends SharedCommandDataProperties {
    required: boolean;
    validator?: (value: string, message: Message) => Awaitable<boolean>;
}
