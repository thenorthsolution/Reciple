import discordjs, { LocalizationMap, PermissionResolvable } from 'discord.js';
import { ContextMenuCommandBuilder, ContextMenuCommandData, ContextMenuCommandExecuteData, ContextMenuCommandExecuteFunction, ContextMenuCommandHaltData, ContextMenuCommandHaltFunction } from '../classes/builders/ContextMenuCommandBuilder';
import { MessageCommandBuilder, MessageCommandData, MessageCommandExecuteData, MessageCommandExecuteFunction, MessageCommandHaltData, MessageCommandHaltFunction } from '../classes/builders/MessageCommandBuilder';
import { AnySlashCommandBuilder, SlashCommandData, SlashCommandExecuteData, SlashCommandExecuteFunction, SlashCommandHaltData, SlashCommandHaltFunction } from '../classes/builders/SlashCommandBuilder';

export enum CommandType {
    ContextMenuCommand,
    MessageCommand,
    SlashCommand
}

export type AnyCommandHaltData = ContextMenuCommandHaltData|MessageCommandHaltData|SlashCommandHaltData;
export type AnyCommandExecuteData = ContextMenuCommandExecuteData|MessageCommandExecuteData|SlashCommandExecuteData;

export type AnyCommandHaltFunction = ContextMenuCommandHaltFunction|MessageCommandHaltFunction|SlashCommandHaltFunction;
export type AnyCommandExecuteFunction = ContextMenuCommandExecuteFunction|MessageCommandExecuteFunction|SlashCommandExecuteFunction;

export type AnyCommandBuilder = ContextMenuCommandBuilder|MessageCommandBuilder|AnySlashCommandBuilder;
export type AnyCommandData = ContextMenuCommandData|MessageCommandData|SlashCommandData;

export type ApplicationCommandBuilder = ContextMenuCommandBuilder|AnySlashCommandBuilder|discordjs.SlashCommandBuilder;

export interface BaseCommandData {
    name: string;
    description: string;
}

export interface BaseInteractionBasedCommandWithoutDescriptionData extends Omit<BaseCommandData, 'description'> {
    nameLocalizations?: LocalizationMap;
    /**
     * @deprecated This property is deprecated and will be removed in the future.
     * You should use `setDefaultMemberPermissions` or `setDMPermission` instead.
     */
    defaultPermission?: boolean;
    defaultMemberPermissions?: PermissionResolvable|null;
    dmPermission?: boolean;
}

export interface BaseInteractionBasedCommandWithDescriptionData extends BaseInteractionBasedCommandWithoutDescriptionData {
    description: string;
    descriptionLocalizations?: LocalizationMap;
}

export type BaseInteractionBasedCommandData<Description extends boolean> = Description extends true
    ? BaseInteractionBasedCommandWithDescriptionData
    : Description extends false
        ? BaseInteractionBasedCommandWithoutDescriptionData
        : never;
