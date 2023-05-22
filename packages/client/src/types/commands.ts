import { ContextMenuCommandBuilder, ContextMenuCommandData, ContextMenuCommandExecuteData, ContextMenuCommandExecuteFunction, ContextMenuCommandHaltData, ContextMenuCommandHaltFunction, ContextMenuCommandPreconditionFunction } from '../classes/builders/ContextMenuCommandBuilder';
import { MessageCommandBuilder, MessageCommandData, MessageCommandExecuteData, MessageCommandExecuteFunction, MessageCommandHaltData, MessageCommandHaltFunction, MessageCommandPreconditionFunction } from '../classes/builders/MessageCommandBuilder';
import { AnySlashCommandBuilder, SlashCommandData, SlashCommandExecuteData, SlashCommandExecuteFunction, SlashCommandHaltData, SlashCommandHaltFunction, SlashCommandPreconditionFunction } from '../classes/builders/SlashCommandBuilder';
import discordjs, { LocalizationMap, PermissionResolvable } from 'discord.js';

export enum CommandType {
    ContextMenuCommand = 1,
    MessageCommand,
    SlashCommand
}

export type AnyCommandHaltData = ContextMenuCommandHaltData|MessageCommandHaltData|SlashCommandHaltData;
export type AnyCommandExecuteData = ContextMenuCommandExecuteData|MessageCommandExecuteData|SlashCommandExecuteData;

export type AnyCommandHaltFunction = ContextMenuCommandHaltFunction|MessageCommandHaltFunction|SlashCommandHaltFunction;
export type AnyCommandExecuteFunction = ContextMenuCommandExecuteFunction|MessageCommandExecuteFunction|SlashCommandExecuteFunction;
export type AnyCommandPreconditionFunction = ContextMenuCommandPreconditionFunction|MessageCommandPreconditionFunction|SlashCommandPreconditionFunction;

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
