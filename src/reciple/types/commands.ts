import { InteractionCommandBuilder, RecipleInteractionCommandExecuteData } from '../classes/builders/InteractionCommandBuilder';
import { RecipleMessageCommandExecuteData } from '../classes/builders/MessageCommandBuilder';
import { CooledDownUser } from '../classes/CommandCooldownManager';
import { MessageCommandOptionManager } from '../classes/MessageCommandOptionManager';
import { RecipleCommandBuilder } from '../types/builders';

/**
 * Halted command's data
 */
export type RecipleHaltedCommandData<Builder extends RecipleCommandBuilder = RecipleCommandBuilder> = CommandErrorData<Builder>|CommandCooldownData<Builder>|(Builder extends InteractionCommandBuilder ? never : CommandInvalidArguments<Builder>|CommandMissingArguments<Builder>)|CommandMissingMemberPermissions<Builder>|CommandMissingBotPermissions<Builder>;

export interface CommandHaltBaseData<Builder extends RecipleCommandBuilder> { executeData: Builder extends InteractionCommandBuilder ? RecipleInteractionCommandExecuteData : RecipleMessageCommandExecuteData }
export interface CommandErrorData<Builder extends RecipleCommandBuilder> extends CommandHaltBaseData<Builder> {
    reason: RecipleHaltedCommandReason.Error; error: any;
}
export interface CommandCooldownData<Builder extends RecipleCommandBuilder> extends CommandHaltBaseData<Builder>,CooledDownUser {
    reason: RecipleHaltedCommandReason.Cooldown;
}
export interface CommandInvalidArguments<Builder extends RecipleCommandBuilder> extends CommandHaltBaseData<Builder> {
    reason: RecipleHaltedCommandReason.InvalidArguments; invalidArguments: MessageCommandOptionManager;
}
export interface CommandMissingArguments<Builder extends RecipleCommandBuilder> extends CommandHaltBaseData<Builder> {
    reason: RecipleHaltedCommandReason.MissingArguments; missingArguments: MessageCommandOptionManager;
}
export interface CommandMissingMemberPermissions<Builder extends RecipleCommandBuilder> extends CommandHaltBaseData<Builder> {
    reason: RecipleHaltedCommandReason.MissingMemberPermissions;
}
export interface CommandMissingBotPermissions<Builder extends RecipleCommandBuilder> extends CommandHaltBaseData<Builder> {
    reason: RecipleHaltedCommandReason.MissingBotPermissions;
}

/**
 * Command halt reasons
 */
export enum RecipleHaltedCommandReason {
    Error,
    Cooldown,
    InvalidArguments,
    MissingArguments,
    MissingMemberPermissions,
    MissingBotPermissions
}
