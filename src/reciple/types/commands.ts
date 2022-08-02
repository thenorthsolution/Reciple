import { MessageCommandExecuteData } from '../classes/builders/MessageCommandBuilder';
import { SlashCommandExecuteData } from '../classes/builders/SlashCommandBuilder';
import { MessageCommandOptionManager } from '../classes/MessageCommandOptionManager';
import { CooledDownUser } from '../classes/CommandCooldownManager';
import { CommandBuilderType, CommandExecuteData } from '../types/builders';

/**
 * Halted command's data
 */
export type CommandHaltData<T extends CommandBuilderType = CommandBuilderType> = CommandErrorData<T>|CommandCooldownData<T>|(T extends CommandBuilderType.SlashCommand ? never : CommandInvalidArguments<T>|CommandMissingArguments<T>)|CommandMissingMemberPermissions<T>|CommandMissingBotPermissions<T>;

export interface CommandHaltBaseData<T extends CommandBuilderType> {
    executeData: T extends CommandBuilderType.SlashCommand
                    ? SlashCommandExecuteData
                    : T extends CommandBuilderType.MessageCommand 
                        ? MessageCommandExecuteData
                        : CommandExecuteData
}

export interface CommandErrorData<T extends CommandBuilderType> extends CommandHaltBaseData<T> {
    reason: CommandHaltReason.Error; error: any;
}
export interface CommandCooldownData<T extends CommandBuilderType> extends CommandHaltBaseData<T>,CooledDownUser {
    reason: CommandHaltReason.Cooldown;
}
export interface CommandInvalidArguments<T extends CommandBuilderType> extends CommandHaltBaseData<T> {
    reason: CommandHaltReason.InvalidArguments; invalidArguments: MessageCommandOptionManager;
}
export interface CommandMissingArguments<T extends CommandBuilderType> extends CommandHaltBaseData<T> {
    reason: CommandHaltReason.MissingArguments; missingArguments: MessageCommandOptionManager;
}
export interface CommandMissingMemberPermissions<T extends CommandBuilderType> extends CommandHaltBaseData<T> {
    reason: CommandHaltReason.MissingMemberPermissions;
}
export interface CommandMissingBotPermissions<T extends CommandBuilderType> extends CommandHaltBaseData<T> {
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
