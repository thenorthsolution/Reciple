import { InteractionCommandBuilder, RecipleInteractionCommandExecuteData } from '../classes/builders/InteractionCommandBuilder';
import { RecipleMessageCommandExecuteData } from '../classes/builders/MessageCommandBuilder';
import { MessageCommandOptionManager } from '../classes/MessageCommandOptionManager';
import { CooledDownUser } from '../classes/CommandCooldownManager';
import { RecipleCommandBuilders } from '../types/builders';

export type RecipleHaltedCommandData<Builder extends RecipleCommandBuilders> = CommandErrorData<Builder>|CommandCooldownData<Builder>|(Builder extends InteractionCommandBuilder ? never : CommandInvalidArguments<Builder>|CommandMissingArguments<Builder>)|CommandMissingMemberPermissions<Builder>|CommandMissingBotPermissions<Builder>;

export interface CommandHaltBaseData<Builder extends RecipleCommandBuilders> { executeData: Builder extends InteractionCommandBuilder ? RecipleInteractionCommandExecuteData : RecipleMessageCommandExecuteData }
export interface CommandErrorData<Builder extends RecipleCommandBuilders> extends CommandHaltBaseData<Builder> {
    reason: RecipleHaltedCommandReasons.Error; error: any;
}
export interface CommandCooldownData<Builder extends RecipleCommandBuilders> extends CommandHaltBaseData<Builder>,CooledDownUser {
    reason: RecipleHaltedCommandReasons.Cooldown;
}
export interface CommandInvalidArguments<Builder extends RecipleCommandBuilders> extends CommandHaltBaseData<Builder> {
    reason: RecipleHaltedCommandReasons.InvalidArguments; invalidArguments: MessageCommandOptionManager;
}
export interface CommandMissingArguments<Builder extends RecipleCommandBuilders> extends CommandHaltBaseData<Builder> {
    reason: RecipleHaltedCommandReasons.MissingArguments; missingArguments: MessageCommandOptionManager;
}
export interface CommandMissingMemberPermissions<Builder extends RecipleCommandBuilders> extends CommandHaltBaseData<Builder> {
    reason: RecipleHaltedCommandReasons.MissingMemberPermissions;
}
export interface CommandMissingBotPermissions<Builder extends RecipleCommandBuilders> extends CommandHaltBaseData<Builder> {
    reason: RecipleHaltedCommandReasons.MissingBotPermissions;
}

export enum RecipleHaltedCommandReasons {
    Error,
    Cooldown,
    InvalidArguments,
    MissingArguments,
    MissingMemberPermissions,
    MissingBotPermissions
}
