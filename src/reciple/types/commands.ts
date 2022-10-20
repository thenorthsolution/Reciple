import { MessageCommandExecuteData, MessageCommandHaltData } from '../classes/builders/MessageCommandBuilder';
import { SlashCommandExecuteData, SlashCommandHaltData } from '../classes/builders/SlashCommandBuilder';
import { MessageCommandOptionManager } from '../classes/managers/MessageCommandOptionManager';
import { CooledDownUser } from '../classes/managers/CommandCooldownManager';
import { RecipleClient } from '../classes/RecipleClient';
import { CommandType } from '../types/builders';

/**
 * Any command halt data
 */
export type AnyCommandHaltData<T = unknown> = SlashCommandHaltData<T> | MessageCommandHaltData<T>;

/**
 * command halt data
 */
export type CommandHaltData<T extends CommandType, M = unknown> = CommandErrorData<T, M> | CommandCooldownData<T, M> | (T extends CommandType.SlashCommand ? never : CommandInvalidArguments<T, M> | CommandMissingArguments<T, M>) | CommandMissingMemberPermissions<T, M> | CommandMissingBotPermissions<T, M>;

/**
 * Any command execute data
 */
export type AnyCommandExecuteData<T = unknown> = SlashCommandExecuteData<T> | MessageCommandExecuteData<T>;

/**
 * Command execute data
 */
export interface BaseCommandExecuteData {
    /**
     * Bot client
     */
    client: RecipleClient<true>;
}

/**
 * Command halt reason base
 */
export interface BaseCommandHaltData<T extends CommandType, M = unknown> {
    /**
     * Halt reason
     */
    reason: CommandHaltReason;
    /**
     * Command execute da6a
     */
    executeData: T extends CommandType.SlashCommand ? SlashCommandExecuteData<M> : T extends CommandType.MessageCommand ? MessageCommandExecuteData<M> : AnyCommandExecuteData<M>;
}

export interface CommandErrorData<T extends CommandType, M = unknown> extends BaseCommandHaltData<T, M> {
    reason: CommandHaltReason.Error;
    /**
     * Caught error
     */
    error: any;
}
export interface CommandCooldownData<T extends CommandType, M = unknown> extends BaseCommandHaltData<T, M>, CooledDownUser {
    reason: CommandHaltReason.Cooldown;
}
export interface CommandInvalidArguments<T extends CommandType, M = unknown> extends BaseCommandHaltData<T, M> {
    reason: CommandHaltReason.InvalidArguments;
    /**
     * Arguments that are invalid
     */
    invalidArguments: MessageCommandOptionManager;
}
export interface CommandMissingArguments<T extends CommandType, M = unknown> extends BaseCommandHaltData<T, M> {
    reason: CommandHaltReason.MissingArguments;
    /**
     * Arguments that are missing
     */
    missingArguments: MessageCommandOptionManager;
}
export interface CommandMissingMemberPermissions<T extends CommandType, M = unknown> extends BaseCommandHaltData<T, M> {
    reason: CommandHaltReason.MissingMemberPermissions;
}
export interface CommandMissingBotPermissions<T extends CommandType, M = unknown> extends BaseCommandHaltData<T, M> {
    reason: CommandHaltReason.MissingBotPermissions;
}

/**
 * Command halt reasons
 */
export enum CommandHaltReason {
    Error,
    Cooldown,
    InvalidArguments,
    MissingArguments,
    MissingMemberPermissions,
    MissingBotPermissions,
}
