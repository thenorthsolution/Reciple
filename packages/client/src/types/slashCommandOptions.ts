import { ApplicationCommandOptionAllowedChannelTypes, ApplicationCommandOptionType, LocalizationMap, SlashCommandAttachmentOption, SlashCommandBooleanOption, SlashCommandChannelOption, SlashCommandIntegerOption, SlashCommandMentionableOption, SlashCommandNumberOption, SlashCommandRoleOption, SlashCommandStringOption, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandUserOption } from 'discord.js';
import { BaseInteractionBasedCommandData } from './commands';

export type SlashCommandOptionResolvable = AnySlashCommandOptionData|AnySlashCommandOptionBuilder;
export type SlashCommandSubcommandsOnlyResolvable = SlashCommandSubcommandOptionsOnlyData|SlashCommandSubcommandOptionsOnlyBuilder;

export type AnySlashCommandOptionData =
    | SlashCommandAttachmentOptionData
    | SlashCommandBooleanOptionData
    | SlashCommandChannelOptionData
    | SlashCommandIntegerOptionData
    | SlashCommandMentionableOptionData
    | SlashCommandNumberOptionData
    | SlashCommandRoleOptionData
    | SlashCommandStringOptionData
    | SlashCommandUserOptionData;

export type AnySlashCommandOptionBuilder =
    | SlashCommandAttachmentOption
    | SlashCommandBooleanOption
    | SlashCommandChannelOption
    | SlashCommandIntegerOption
    | SlashCommandMentionableOption
    | SlashCommandNumberOption
    | SlashCommandRoleOption
    | SlashCommandStringOption
    | SlashCommandUserOption;

export type SlashCommandSubcommandOptionsOnlyData =
    | SlashCommandSubcommandData
    | SlashCommandSubcommandGroupData;

export type SlashCommandSubcommandOptionsOnlyBuilder =
    | SlashCommandSubcommandBuilder
    | SlashCommandSubcommandGroupBuilder;

export interface BaseSlashCommandOptionData<V = string|number> extends BaseInteractionBasedCommandData<true> {
    choices?: {
        name: string;
        nameLocalizations?: LocalizationMap;
        value: V;
    }[];
    autocomplete?: boolean;
    required?: boolean;
}

export interface SlashCommandAttachmentOptionData extends Omit<BaseSlashCommandOptionData, 'choices'|'autocomplete'> {
    type: ApplicationCommandOptionType.Attachment;
}

export interface SlashCommandBooleanOptionData extends Omit<BaseSlashCommandOptionData, 'choices'|'autocomplete'> {
    type: ApplicationCommandOptionType.Boolean;
}

export interface SlashCommandChannelOptionData extends Omit<BaseSlashCommandOptionData, 'choices'|'autocomplete'> {
    type: ApplicationCommandOptionType.Channel;
    channelTypes?: ApplicationCommandOptionAllowedChannelTypes[];
}

export interface SlashCommandIntegerOptionData extends BaseSlashCommandOptionData<number> {
    type: ApplicationCommandOptionType.Integer;
    minValue?: number;
    maxValue?: number;
}

export interface SlashCommandMentionableOptionData extends Omit<BaseSlashCommandOptionData, 'choices'|'autocomplete'> {
    type: ApplicationCommandOptionType.Mentionable;
}

export interface SlashCommandNumberOptionData extends BaseSlashCommandOptionData<number> {
    type: ApplicationCommandOptionType.Number;
    minValue?: number;
    maxValue?: number;
}

export interface SlashCommandRoleOptionData extends Omit<BaseSlashCommandOptionData, 'choices'|'autocomplete'> {
    type: ApplicationCommandOptionType.Role;
}

export interface SlashCommandStringOptionData extends BaseSlashCommandOptionData<string> {
    type: ApplicationCommandOptionType.String;
    minLength?: number;
    maxLength?: number;
}

export interface SlashCommandUserOptionData extends Omit<BaseSlashCommandOptionData, 'choices'|'autocomplete'> {
    type: ApplicationCommandOptionType.User;
}

export interface SlashCommandSubcommandData extends Omit<BaseSlashCommandOptionData, 'choices'|'autocomplete'> {
    type: ApplicationCommandOptionType.Subcommand;
    options?: SlashCommandOptionResolvable[];
}

export interface SlashCommandSubcommandGroupData extends Omit<BaseSlashCommandOptionData, 'choices'|'autocomplete'> {
    type: ApplicationCommandOptionType.SubcommandGroup;
    options: SlashCommandSubcommandGroupData[];
}
