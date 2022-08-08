import { MessageCommandExecuteData, MessageCommandHaltData } from '../classes/builders/MessageCommandBuilder';
import { SlashCommandExecuteData, SlashCommandHaltData } from '../classes/builders/SlashCommandBuilder';
import { MessageCommandOptionManager } from '../classes/MessageCommandOptionManager';
import { CooledDownUser } from '../classes/CommandCooldownManager';
import { RecipleClient } from '../classes/RecipleClient';
import { CommandBuilderType } from '../types/builders';

/**
 * Any command halt data
 */
export type AnyCommandHaltData = SlashCommandHaltData|MessageCommandHaltData;

/**
 * command halt data
 */
export type CommandHaltData<T extends CommandBuilderType> = CommandErrorData<T>|CommandCooldownData<T>|(T extends CommandBuilderType.SlashCommand ? never : CommandInvalidArguments<T>|CommandMissingArguments<T>)|CommandMissingMemberPermissions<T>|CommandMissingBotPermissions<T>;

/**
 * Any command execute data
 */
export type AnyCommandExecuteData = SlashCommandExecuteData|MessageCommandExecuteData;

/**
 * Command execute data
 */
export interface BaseCommandExecuteData {
    client: RecipleClient<true>;
}

/**
 * Command halt reason base
 */
export interface BaseCommandHaltData<T extends CommandBuilderType> {
    executeData: T extends CommandBuilderType.SlashCommand
                    ? SlashCommandExecuteData
                    : T extends CommandBuilderType.MessageCommand 
                        ? MessageCommandExecuteData
                        : AnyCommandExecuteData
}

export interface CommandErrorData<T extends CommandBuilderType> extends BaseCommandHaltData<T> {
    reason: CommandHaltReason.Error;
    error: any;
}
export interface CommandCooldownData<T extends CommandBuilderType> extends BaseCommandHaltData<T>,CooledDownUser {
    reason: CommandHaltReason.Cooldown;
}
export interface CommandInvalidArguments<T extends CommandBuilderType> extends BaseCommandHaltData<T> {
    reason: CommandHaltReason.InvalidArguments;
    invalidArguments: MessageCommandOptionManager;
}
export interface CommandMissingArguments<T extends CommandBuilderType> extends BaseCommandHaltData<T> {
    reason: CommandHaltReason.MissingArguments;
    missingArguments: MessageCommandOptionManager;
}
export interface CommandMissingMemberPermissions<T extends CommandBuilderType> extends BaseCommandHaltData<T> {
    reason: CommandHaltReason.MissingMemberPermissions;
}
export interface CommandMissingBotPermissions<T extends CommandBuilderType> extends BaseCommandHaltData<T> {
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
