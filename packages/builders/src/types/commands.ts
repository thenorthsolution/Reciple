import { If, LocalizationMap, PermissionResolvable } from 'discord.js';
import { ContextMenuCommandBuilder, ContextMenuCommandData, ContextMenuCommandExecuteData, ContextMenuCommandExecuteFunction, ContextMenuCommandHaltData, ContextMenuCommandHaltFunction } from '../classes/builders/ContextMenuCommandBuilder';
import { MessageCommandBuilder, MessageCommandData, MessageCommandExecuteData, MessageCommandExecuteFunction, MessageCommandHaltData, MessageCommandHaltFunction } from '../classes/builders/MessageCommandBuilder';
import { AnySlashCommandBuilder, SlashCommandData, SlashCommandExecuteData, SlashCommandExecuteFunction, SlashCommandHaltData, SlashCommandHaltFunction } from '../classes/builders/SlashCommandBuilder';

export enum CommandType {
    SlashCommand = 1,
    MessageCommand,
    ContextMenuCommand
}

export type AnyCommandHaltData<Metadata = unknown> = ContextMenuCommandHaltData<Metadata>|MessageCommandHaltData<Metadata>|SlashCommandHaltData<Metadata>;
export type AnyCommandExecuteData<Metadata = unknown> = ContextMenuCommandExecuteData<Metadata>|MessageCommandExecuteData<Metadata>|SlashCommandExecuteData<Metadata>;

export type AnyCommandHaltFunction<Metadata = unknown> = ContextMenuCommandHaltFunction<Metadata>|MessageCommandHaltFunction<Metadata>|SlashCommandHaltFunction<Metadata>;
export type AnyCommandExecuteFunction<Metadata = unknown> = ContextMenuCommandExecuteFunction<Metadata>|MessageCommandExecuteFunction<Metadata>|SlashCommandExecuteFunction<Metadata>;

export type AnyCommandBuilder<Metadata = unknown> = ContextMenuCommandBuilder<Metadata>|MessageCommandBuilder<Metadata>|AnySlashCommandBuilder<Metadata>;
export type AnyCommandData<Metadata = unknown> = ContextMenuCommandData<Metadata>|MessageCommandData<Metadata>|SlashCommandData<Metadata>;

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
