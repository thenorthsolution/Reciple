import { InteractionCommandBuilder, InteractionCommandExecuteData } from '../classes/builders/InteractionCommandBuilder';
import { MessageCommandExecuteData } from '../classes/builders/MessageCommandBuilder';
import { CooledDownUser } from '../classes/CommandCooldownManager';
import { MessageCommandOptionManager } from '../classes/MessageCommandOptionManager';
import { RecipleCommandBuilder } from '../types/builders';

/**
 * Halted command's data
 */
export type RecipleHaltedCommandData<Builder extends RecipleCommandBuilder = RecipleCommandBuilder> = RecipleCommandErrorData<Builder>|RecipleCommandCooldownData<Builder>|(Builder extends InteractionCommandBuilder ? never : RecipleCommandInvalidArguments<Builder>|RecipleCommandMissingArguments<Builder>)|RecipleCommandMissingMemberPermissions<Builder>|RecipleCommandMissingBotPermissions<Builder>;

export interface RecipleCommandHaltBaseData<Builder extends RecipleCommandBuilder> { executeData: Builder extends InteractionCommandBuilder ? InteractionCommandExecuteData : MessageCommandExecuteData }
export interface RecipleCommandErrorData<Builder extends RecipleCommandBuilder> extends RecipleCommandHaltBaseData<Builder> {
    reason: RecipleHaltedCommandReason.Error; error: any;
}
export interface RecipleCommandCooldownData<Builder extends RecipleCommandBuilder> extends RecipleCommandHaltBaseData<Builder>,CooledDownUser {
    reason: RecipleHaltedCommandReason.Cooldown;
}
export interface RecipleCommandInvalidArguments<Builder extends RecipleCommandBuilder> extends RecipleCommandHaltBaseData<Builder> {
    reason: RecipleHaltedCommandReason.InvalidArguments; invalidArguments: MessageCommandOptionManager;
}
export interface RecipleCommandMissingArguments<Builder extends RecipleCommandBuilder> extends RecipleCommandHaltBaseData<Builder> {
    reason: RecipleHaltedCommandReason.MissingArguments; missingArguments: MessageCommandOptionManager;
}
export interface RecipleCommandMissingMemberPermissions<Builder extends RecipleCommandBuilder> extends RecipleCommandHaltBaseData<Builder> {
    reason: RecipleHaltedCommandReason.MissingMemberPermissions;
}
export interface RecipleCommandMissingBotPermissions<Builder extends RecipleCommandBuilder> extends RecipleCommandHaltBaseData<Builder> {
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
