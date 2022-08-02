import { MessageCommandExecuteData } from '../classes/builders/MessageCommandBuilder';
import { MessageCommandOptionManager } from '../classes/MessageCommandOptionManager';
import { SlashCommandExecuteData } from '../classes/builders/SlashCommandBuilder';
import { CommandBuilderType, AnyCommandExecuteData } from '../types/builders';
import { CooledDownUser } from '../classes/CommandCooldownManager';

/**
 * Any Halted command's data
 */
export type AnyCommandHaltData<T extends CommandBuilderType = CommandBuilderType> = CommandErrorData<T>|CommandCooldownData<T>|(T extends CommandBuilderType.SlashCommand ? never : CommandInvalidArguments<T>|CommandMissingArguments<T>)|CommandMissingMemberPermissions<T>|CommandMissingBotPermissions<T>;

/**
 * 
 */

export interface CommandHaltReasonBase<T extends CommandBuilderType> {
    executeData: T extends CommandBuilderType.SlashCommand
                    ? SlashCommandExecuteData
                    : T extends CommandBuilderType.MessageCommand 
                        ? MessageCommandExecuteData
                        : AnyCommandExecuteData
}

export interface CommandErrorData<T extends CommandBuilderType> extends CommandHaltReasonBase<T> {
    reason: CommandHaltReason.Error; error: any;
}
export interface CommandCooldownData<T extends CommandBuilderType> extends CommandHaltReasonBase<T>,CooledDownUser {
    reason: CommandHaltReason.Cooldown;
}
export interface CommandInvalidArguments<T extends CommandBuilderType> extends CommandHaltReasonBase<T> {
    reason: CommandHaltReason.InvalidArguments; invalidArguments: MessageCommandOptionManager;
}
export interface CommandMissingArguments<T extends CommandBuilderType> extends CommandHaltReasonBase<T> {
    reason: CommandHaltReason.MissingArguments; missingArguments: MessageCommandOptionManager;
}
export interface CommandMissingMemberPermissions<T extends CommandBuilderType> extends CommandHaltReasonBase<T> {
    reason: CommandHaltReason.MissingMemberPermissions;
}
export interface CommandMissingBotPermissions<T extends CommandBuilderType> extends CommandHaltReasonBase<T> {
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
