import { ContextMenuCommandExecuteData } from '../classes/builders/ContextMenuCommandBuilder';
import { MessageCommandExecuteData } from '../classes/builders/MessageCommandBuilder';
import { SlashCommandExecuteData } from '../classes/builders/SlashCommandBuilder';
import { CommandCooldownData } from '../classes/managers/CommandCooldownManager';
import { MessageCommandOptionManager } from '../classes/managers/MessageCommandOptionManager';
import { CommandType } from './commands';

export enum CommandHaltReason {
    Error = 1,
    Cooldown,
    InvalidArguments,
    MissingArguments,
    ValidateOptionError,
    MissingMemberPermissions,
    MissingBotPermissions,
    NoExecuteHandler
}

export type CommandHaltData<T extends CommandType, M = unknown> =
    | CommandErrorHaltData<T, M>
    | CommandCooldownHaltData<T, M>
    | (T extends CommandType.MessageCommand ? CommandInvalidArgumentsHaltData<T, M> | CommandMissingArgumentsHaltData<T, M> | CommandValidateOptionErrorHaltData<T, M> : never)
    | CommandMissingMemberPermissionsHaltData<T, M>
    | CommandMissingBotPermissionsHaltData<T, M>
    | CommandNoExecuteHandlerHaltData<T, M>;

export interface BaseCommandHaltData<T extends CommandType, Metadata = unknown> {
    reason: CommandHaltReason;
    commandType: T;
    executeData: T extends CommandType.ContextMenuCommand
        ? ContextMenuCommandExecuteData<Metadata>
        : T extends CommandType.MessageCommand
            ? MessageCommandExecuteData<Metadata>
            : T extends CommandType.SlashCommand
                ? SlashCommandExecuteData<Metadata>
                : never;
}

export interface CommandErrorHaltData<T extends CommandType, M = unknown> extends BaseCommandHaltData<T, M> {
    reason: CommandHaltReason.Error;
    error: any;
}

export interface CommandCooldownHaltData<T extends CommandType, M = unknown> extends BaseCommandHaltData<T, M> {
    reason: CommandHaltReason.Cooldown;
    cooldownData: CommandCooldownData;
}

export interface CommandInvalidArgumentsHaltData<T extends CommandType, M = unknown> extends BaseCommandHaltData<T, M> {
    reason: CommandHaltReason.InvalidArguments;
    invalidArguments: MessageCommandOptionManager;
}

export interface CommandMissingArgumentsHaltData<T extends CommandType, M = unknown> extends BaseCommandHaltData<T, M> {
    reason: CommandHaltReason.MissingArguments;
    missingArguments: MessageCommandOptionManager;
}

export interface CommandValidateOptionErrorHaltData<T extends CommandType, M = unknown> extends BaseCommandHaltData<T, M> {
    reason: CommandHaltReason.ValidateOptionError;
    error: any;
}

export interface CommandMissingMemberPermissionsHaltData<T extends CommandType, M = unknown> extends BaseCommandHaltData<T, M> {
    reason: CommandHaltReason.MissingMemberPermissions;
}

export interface CommandMissingBotPermissionsHaltData<T extends CommandType, M = unknown> extends BaseCommandHaltData<T, M> {
    reason: CommandHaltReason.MissingBotPermissions;
}

export interface CommandNoExecuteHandlerHaltData<T extends CommandType, M = unknown> extends BaseCommandHaltData<T, M> {
    reason: CommandHaltReason.NoExecuteHandler;
}
