import { If, LocalizationMap, PermissionResolvable } from 'discord.js';
import { ContextMenuCommandExecuteData, ContextMenuCommandExecuteFunction, ContextMenuCommandHaltData, ContextMenuCommandHaltFunction } from '../classes/builders/ContextMenuCommandBuilder';
import { MessageCommandExecuteData, MessageCommandExecuteFunction, MessageCommandHaltData, MessageCommandHaltFunction } from '../classes/builders/MessageCommandBuilder';

export enum CommandType {
    SlashCommand = 1,
    MessageCommand,
    ContextMenuCommand
}

export type AnyCommandHaltData<Metadata = unknown> = ContextMenuCommandHaltData<Metadata>|MessageCommandHaltData<Metadata>;
export type AnyCommandExecuteData<Metadata = unknown> = ContextMenuCommandExecuteData<Metadata>|MessageCommandExecuteData<Metadata>;

export type AnyCommandHaltFunction<Metadata = unknown> = ContextMenuCommandHaltFunction<Metadata>|MessageCommandHaltFunction<Metadata>;
export type AnyCommandExecuteFunction<Metadata = unknown> = ContextMenuCommandExecuteFunction<Metadata>|MessageCommandExecuteFunction<Metadata>;

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
