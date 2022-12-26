import { MessageCommandExecuteData } from '../classes/builders/MessageCommandBuilder';
import { SlashCommandExecuteData } from '../classes/builders/SlashCommandBuilder';
import { CommandCooldownData } from '../classes/managers/CommandCooldownManager';
import { MessageCommandOptionManager } from '../classes/managers/MessageCommandOptionManager';
import { AnyCommandExecuteData, CommandType } from './builders';

export interface BaseCommandHaltData<T extends CommandType, Metadata = unknown> {
    reason: CommandHaltReason;
    executeData: T extends CommandType.SlashCommand
        ? SlashCommandExecuteData<Metadata>
        : T extends CommandType.MessageCommand
            ? MessageCommandExecuteData<Metadata>
            : AnyCommandExecuteData<Metadata>;
}

export type CommandHaltData<T extends CommandType, M = unknown> =
    | CommandErrorHaltData<T, M>
    | CommandCooldownHaltData<T, M>
    | (T extends CommandType.SlashCommand ? never : CommandInvalidArgumentsHaltData<T, M> | CommandMissingArgumentsHaltData<T, M>)
    | CommandMissingMemberPermissionsHaltData<T, M>
    | CommandMissingBotPermissionsHaltData<T, M>;

export interface CommandErrorHaltData<T extends CommandType, M = unknown> extends BaseCommandHaltData<T, M> {
    reason: CommandHaltReason.Error;
    error: any;
}

export interface CommandCooldownHaltData<T extends CommandType, M = unknown> extends BaseCommandHaltData<T, M>, CommandCooldownData {
    reason: CommandHaltReason.Cooldown;
}

export interface CommandInvalidArgumentsHaltData<T extends CommandType, M = unknown> extends BaseCommandHaltData<T, M> {
    reason: CommandHaltReason.InvalidArguments;
    invalidArguments: MessageCommandOptionManager;
}

export interface CommandMissingArgumentsHaltData<T extends CommandType, M = unknown> extends BaseCommandHaltData<T, M> {
    reason: CommandHaltReason.MissingArguments;
    missingArguments: MessageCommandOptionManager;
}

export interface CommandMissingMemberPermissionsHaltData<T extends CommandType, M = unknown> extends BaseCommandHaltData<T, M> {
    reason: CommandHaltReason.MissingMemberPermissions;
}

export interface CommandMissingBotPermissionsHaltData<T extends CommandType, M = unknown> extends BaseCommandHaltData<T, M> {
    reason: CommandHaltReason.MissingBotPermissions;
}

export enum CommandHaltReason {
    Error = 1,
    Cooldown,
    InvalidArguments,
    MissingArguments,
    MissingMemberPermissions,
    MissingBotPermissions,
}
