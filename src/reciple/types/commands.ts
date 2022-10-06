import { MessageCommandExecuteData, MessageCommandHaltData } from '../classes/builders/MessageCommandBuilder';
import { SlashCommandExecuteData, SlashCommandHaltData } from '../classes/builders/SlashCommandBuilder';
import { MessageCommandOptionManager } from '../classes/MessageCommandOptionManager';
import { CooledDownUser } from '../classes/CommandCooldownManager';
import { RecipleClient } from '../classes/RecipleClient';
import { CommandBuilderType } from '../types/builders';

/**
 * Any command halt data
 */
export type AnyCommandHaltData<T = unknown> = SlashCommandHaltData<T>|MessageCommandHaltData<T>;

/**
 * command halt data
 */
export type CommandHaltData<T extends CommandBuilderType, M = unknown> = CommandErrorData<T, M>|CommandCooldownData<T, M>|(T extends CommandBuilderType.SlashCommand ? never : CommandInvalidArguments<T, M>|CommandMissingArguments<T, M>)|CommandMissingMemberPermissions<T, M>|CommandMissingBotPermissions<T, M>;

/**
 * Any command execute data
 */
export type AnyCommandExecuteData<T = unknown> = SlashCommandExecuteData<T>|MessageCommandExecuteData<T>;

/**
 * Command execute data
 */
export interface BaseCommandExecuteData {
    client: RecipleClient<true>;
}

/**
 * Command halt reason base
 */
export interface BaseCommandHaltData<T extends CommandBuilderType, M = unknown> {
    executeData: T extends CommandBuilderType.SlashCommand
                    ? SlashCommandExecuteData<M>
                    : T extends CommandBuilderType.MessageCommand 
                        ? MessageCommandExecuteData<M>
                        : AnyCommandExecuteData<M>
}

export interface CommandErrorData<T extends CommandBuilderType, M = unknown> extends BaseCommandHaltData<T, M> {
    reason: CommandHaltReason.Error;
    error: any;
}
export interface CommandCooldownData<T extends CommandBuilderType, M = unknown> extends BaseCommandHaltData<T, M>,CooledDownUser {
    reason: CommandHaltReason.Cooldown;
}
export interface CommandInvalidArguments<T extends CommandBuilderType, M = unknown> extends BaseCommandHaltData<T, M> {
    reason: CommandHaltReason.InvalidArguments;
    invalidArguments: MessageCommandOptionManager;
}
export interface CommandMissingArguments<T extends CommandBuilderType, M = unknown> extends BaseCommandHaltData<T, M> {
    reason: CommandHaltReason.MissingArguments;
    missingArguments: MessageCommandOptionManager;
}
export interface CommandMissingMemberPermissions<T extends CommandBuilderType, M = unknown> extends BaseCommandHaltData<T, M> {
    reason: CommandHaltReason.MissingMemberPermissions;
}
export interface CommandMissingBotPermissions<T extends CommandBuilderType, M = unknown> extends BaseCommandHaltData<T, M> {
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
    MissingBotPermissions
}
