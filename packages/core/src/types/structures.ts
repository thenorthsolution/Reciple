import { ContextMenuCommandExecuteData, ContextMenuCommandExecuteFunction, ContextMenuCommandHaltData, ContextMenuCommandHaltFunction } from '../classes/builders/ContextMenuCommandBuilder';
import { CommandHaltReason, CommandType } from './constants';
import { Cooldown } from '../classes/structures/Cooldown';
import { MessageCommandExecuteData, MessageCommandExecuteFunction, MessageCommandHaltData, MessageCommandHaltFunction } from '../classes/builders/MessageCommandBuilder';

export interface RecipleClientConfig {
    token: string;
    version: string;
}

export type AnyCommandHaltData = ContextMenuCommandHaltData|MessageCommandHaltData;
export type AnyCommandHaltFunction = ContextMenuCommandHaltFunction|MessageCommandHaltFunction;
export type AnyCommandExecuteData = ContextMenuCommandExecuteData|MessageCommandExecuteData;
export type AnyCommandExecuteFunction = ContextMenuCommandExecuteFunction|MessageCommandExecuteFunction;

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
    missingArguments:;
}

export interface CommandMissingArgumentsHaltData<T extends CommandType> extends BaseCommandHaltData<T> {
    reason: CommandHaltReason.MissingArguments;
    missingArguments:;
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
