import { ContextMenuCommandExecuteData, ContextMenuCommandHaltData } from '../classes/builders/ContextMenuCommandBuilder';
import { MessageCommandExecuteData } from '../classes/builders/MessageCommandBuilder';
import { CommandType } from './commands';

export enum CommandHaltReason {
    Error = 1,
    Cooldown,
    InvalidArguments,
    MissingArguments,
    MissingMemberPermissions,
    MissingBotPermissions,
}

export type CommandHaltData<T extends CommandType, M = unknown> =
    | CommandErrorHaltData<T, M>
    | CommandCooldownHaltData<T, M>
    | (T extends CommandType.MessageCommand ? CommandInvalidArgumentsHaltData<T, M> | CommandMissingArgumentsHaltData<T, M> : never)
    | CommandMissingMemberPermissionsHaltData<T, M>
    | CommandMissingBotPermissionsHaltData<T, M>;

export interface BaseCommandHaltData<T extends CommandType, Metadata = unknown> {
    reason: CommandHaltReason;
    commandType: T;
    executeData: T extends CommandType.ContextMenuCommand
        ? ContextMenuCommandExecuteData<Metadata>
        : T extends CommandType.MessageCommand
            ? MessageCommandExecuteData<Metadata>
            : never;
}

export interface CommandErrorHaltData<T extends CommandType, M = unknown> extends BaseCommandHaltData<T, M> {
    reason: CommandHaltReason.Error;
    error: any;
}

// TODO: Cooldown data
export interface CommandCooldownHaltData<T extends CommandType, M = unknown> extends BaseCommandHaltData<T, M> {
    reason: CommandHaltReason.Cooldown;
}

// TODO: Arguments manager
export interface CommandInvalidArgumentsHaltData<T extends CommandType, M = unknown> extends BaseCommandHaltData<T, M> {
    reason: CommandHaltReason.InvalidArguments;
    invalidArguments: string[];
}

// TODO: Arguments manager
export interface CommandMissingArgumentsHaltData<T extends CommandType, M = unknown> extends BaseCommandHaltData<T, M> {
    reason: CommandHaltReason.MissingArguments;
    missingArguments: string[];
}

export interface CommandMissingMemberPermissionsHaltData<T extends CommandType, M = unknown> extends BaseCommandHaltData<T, M> {
    reason: CommandHaltReason.MissingMemberPermissions;
}

export interface CommandMissingBotPermissionsHaltData<T extends CommandType, M = unknown> extends BaseCommandHaltData<T, M> {
    reason: CommandHaltReason.MissingBotPermissions;
}
