import { ContextMenuCommandExecuteData, ContextMenuCommandExecuteFunction, ContextMenuCommandHaltData, ContextMenuCommandHaltFunction } from '../classes/builders/ContextMenuCommandBuilder';
import { CommandHaltReason, CommandType } from './constants';
import { Cooldown } from '../classes/structures/Cooldown';
import { MessageCommandExecuteData, MessageCommandExecuteFunction, MessageCommandHaltData, MessageCommandHaltFunction } from '../classes/builders/MessageCommandBuilder';
import { Collection, SlashCommandAttachmentOption, SlashCommandBooleanOption, SlashCommandChannelOption, SlashCommandIntegerOption, SlashCommandMentionableOption, SlashCommandNumberOption, SlashCommandRoleOption, SlashCommandStringOption, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandUserOption } from 'discord.js';
import { MessageCommandOptionValue } from '../classes/structures/MessageCommandOptionValue';
import { SlashCommandExecuteData, SlashCommandExecuteFunction, SlashCommandHaltData, SlashCommandHaltFunction } from '../classes/builders/SlashCommandBuilder';

// Config
export interface RecipleClientConfig {
    token: string;
    version: string;
}

// Any types
export type AnyCommandHaltData = ContextMenuCommandHaltData|MessageCommandHaltData|SlashCommandHaltData;
export type AnyCommandHaltFunction = ContextMenuCommandHaltFunction|MessageCommandHaltFunction|SlashCommandHaltFunction;
export type AnyCommandExecuteData = ContextMenuCommandExecuteData|MessageCommandExecuteData|SlashCommandExecuteData;
export type AnyCommandExecuteFunction = ContextMenuCommandExecuteFunction|MessageCommandExecuteFunction|SlashCommandExecuteFunction;
export type AnyNonSubcommandSlashCommandOptionBuilder = SlashCommandAttachmentOption|SlashCommandBooleanOption|SlashCommandChannelOption|SlashCommandIntegerOption|SlashCommandMentionableOption|SlashCommandNumberOption|SlashCommandRoleOption|SlashCommandStringOption|SlashCommandUserOption;
export type AnySubcommandSlashCommandOptionBuilder = SlashCommandSubcommandBuilder|SlashCommandSubcommandGroupBuilder;
export type AnyNonSubcommandSlashCommandOptionData = ReturnType<AnyNonSubcommandSlashCommandOptionBuilder['toJSON']>;
export type AnySubcommandSlashCommandOptionData = ReturnType<AnySubcommandSlashCommandOptionBuilder['toJSON']>;
export type AnySlashCommandOptionBuilder = AnyNonSubcommandSlashCommandOptionBuilder|AnySubcommandSlashCommandOptionBuilder;
export type AnySlashCommandOptionData = AnyNonSubcommandSlashCommandOptionData|AnySubcommandSlashCommandOptionData;

// Command Halt
export type CommandHaltData<T extends CommandType> =
    | CommandErrorHaltData<T>
    | CommandCooldownHaltData<T>
    | (T extends CommandType.MessageCommand ? CommandInvalidArgumentsHaltData<T> | CommandMissingArgumentsHaltData<T> | CommandValidateOptionErrorHaltData<T> : never)
    | CommandMissingMemberPermissionsHaltData<T>
    | CommandMissingBotPermissionsHaltData<T>
    | CommandPreconditionErrorHaltData<T>;

export interface BaseCommandHaltData<T extends CommandType> {
    reason: CommandHaltReason;
    commandType: T;
    executeData: T extends CommandType.ContextMenuCommand
        ? ContextMenuCommandExecuteData
        : T extends CommandType.MessageCommand
            ? MessageCommandExecuteData
            : T extends CommandType.SlashCommand
                ? SlashCommandExecuteData
                : never;
}

export interface CommandErrorHaltData<T extends CommandType> extends BaseCommandHaltData<T> {
    reason: CommandHaltReason.Error;
    error: any;
}

export interface CommandCooldownHaltData<T extends CommandType> extends BaseCommandHaltData<T> {
    reason: CommandHaltReason.Cooldown;
    cooldown: Cooldown;
}

export interface CommandInvalidArgumentsHaltData<T extends CommandType> extends BaseCommandHaltData<T> {
    reason: CommandHaltReason.InvalidArguments;
    invalidOptions: Collection<string, MessageCommandOptionValue>;
}

export interface CommandMissingArgumentsHaltData<T extends CommandType> extends BaseCommandHaltData<T> {
    reason: CommandHaltReason.MissingArguments;
    missingOptions: Collection<string, MessageCommandOptionValue>;
}

export interface CommandValidateOptionErrorHaltData<T extends CommandType> extends BaseCommandHaltData<T> {
    reason: CommandHaltReason.ValidateOptionError;
    error: unknown;
}

export interface CommandMissingMemberPermissionsHaltData<T extends CommandType> extends BaseCommandHaltData<T> {
    reason: CommandHaltReason.MissingMemberPermissions;
}

export interface CommandMissingBotPermissionsHaltData<T extends CommandType> extends BaseCommandHaltData<T> {
    reason: CommandHaltReason.MissingBotPermissions;
}

export interface CommandNoExecuteHandlerHaltData<T extends CommandType> extends BaseCommandHaltData<T> {
    reason: CommandHaltReason.NoExecuteHandler;
}

export interface CommandPreconditionErrorHaltData<T extends CommandType> extends BaseCommandHaltData<T> {
    reason: CommandHaltReason.PreconditionError;
    error: unknown;
}
