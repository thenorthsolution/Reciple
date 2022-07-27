import { MessageCommandExecuteData } from '../classes/builders/MessageCommandBuilder';
import { SlashCommandBuilder, SlashCommandExecuteData } from '../classes/builders/SlashCommandBuilder';
import { CooledDownUser } from '../classes/CommandCooldownManager';
import { MessageCommandOptionManager } from '../classes/MessageCommandOptionManager';
import { CommandBuilder } from '../types/builders';

/**
 * Halted command's data
 */
export type HaltedCommandData<Builder extends CommandBuilder = CommandBuilder> = CommandErrorData<Builder>|CommandCooldownData<Builder>|(Builder extends SlashCommandBuilder ? never : CommandInvalidArguments<Builder>|CommandMissingArguments<Builder>)|CommandMissingMemberPermissions<Builder>|CommandMissingBotPermissions<Builder>;

export interface CommandHaltBaseData<Builder extends CommandBuilder> { executeData: Builder extends SlashCommandBuilder ? SlashCommandExecuteData : MessageCommandExecuteData }
export interface CommandErrorData<Builder extends CommandBuilder> extends CommandHaltBaseData<Builder> {
    reason: HaltedCommandReason.Error; error: any;
}
export interface CommandCooldownData<Builder extends CommandBuilder> extends CommandHaltBaseData<Builder>,CooledDownUser {
    reason: HaltedCommandReason.Cooldown;
}
export interface CommandInvalidArguments<Builder extends CommandBuilder> extends CommandHaltBaseData<Builder> {
    reason: HaltedCommandReason.InvalidArguments; invalidArguments: MessageCommandOptionManager;
}
export interface CommandMissingArguments<Builder extends CommandBuilder> extends CommandHaltBaseData<Builder> {
    reason: HaltedCommandReason.MissingArguments; missingArguments: MessageCommandOptionManager;
}
export interface CommandMissingMemberPermissions<Builder extends CommandBuilder> extends CommandHaltBaseData<Builder> {
    reason: HaltedCommandReason.MissingMemberPermissions;
}
export interface CommandMissingBotPermissions<Builder extends CommandBuilder> extends CommandHaltBaseData<Builder> {
    reason: HaltedCommandReason.MissingBotPermissions;
}

/**
 * Command halt reasons
 */
export enum HaltedCommandReason {
    Error,
    Cooldown,
    InvalidArguments,
    MissingArguments,
    MissingMemberPermissions,
    MissingBotPermissions
}
