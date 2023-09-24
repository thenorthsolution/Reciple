import { MessageCommandOptionManager } from '../classes/managers/MessageCommandOptionManager';
import { ContextMenuCommandExecuteData } from '../classes/builders/ContextMenuCommandBuilder';
import { MessageCommandExecuteData } from '../classes/builders/MessageCommandBuilder';
import { SlashCommandExecuteData } from '../classes/builders/SlashCommandBuilder';
import { CommandCooldownData } from '../classes/managers/CommandCooldownManager';
import { CommandType } from './commands';

export enum CommandHaltReason {
    Error = 1,
    Cooldown,
    InvalidArguments,
    MissingArguments,
    ValidateOptionError,
    MissingMemberPermissions,
    MissingBotPermissions,
    NoExecuteHandler,
    PreconditionError
}

export type CommandHaltData<T extends CommandType> =
    | CommandErrorHaltData<T>
    | CommandCooldownHaltData<T>
    | (T extends CommandType.MessageCommand ? CommandInvalidArgumentsHaltData<T> | CommandMissingArgumentsHaltData<T> | CommandValidateOptionErrorHaltData<T> : never)
    | CommandMissingMemberPermissionsHaltData<T>
    | CommandMissingBotPermissionsHaltData<T>
    | CommandNoExecuteHandlerHaltData<T>
    | CommandPreconditionErrorHaltData<T>;

export interface BaseCommandHaltData<T extends CommandType> {
    reason: CommandHaltReason;
    commandType: T;
    executeData: T extends CommandType.ContextMenuCommand
        ? ContextMenuCommandExecuteData
        : T extends CommandType.MessageCommand
            ? MessageCommandExecuteData<boolean>
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
    cooldownData: CommandCooldownData;
}

export interface CommandInvalidArgumentsHaltData<T extends CommandType> extends BaseCommandHaltData<T> {
    reason: CommandHaltReason.InvalidArguments;
    invalidArguments: MessageCommandOptionManager;
}

export interface CommandMissingArgumentsHaltData<T extends CommandType> extends BaseCommandHaltData<T> {
    reason: CommandHaltReason.MissingArguments;
    missingArguments: MessageCommandOptionManager;
}

export interface CommandValidateOptionErrorHaltData<T extends CommandType> extends BaseCommandHaltData<T> {
    reason: CommandHaltReason.ValidateOptionError;
    error: any;
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
    error: any;
}
