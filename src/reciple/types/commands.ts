import { InteractionCommandBuilder, RecipleInteractionCommandExecuteData } from '../classes/builders/InteractionCommandBuilder';
import { RecipleMessageCommandExecuteData } from '../classes/builders/MessageCommandBuilder';
import { MessageCommandOptionManager } from '../classes/MessageCommandOptionManager';
import { CooledDownUser } from '../classes/CommandCooldownManager';
import { RecipleCommandBuilders } from '../modules';

export type CommandHaltReason<Builder extends RecipleCommandBuilders> = RecipleHaltedCommandData<Builder>["reason"];
export type RecipleHaltedCommandData<Builder extends RecipleCommandBuilders> = CommandErrorData<Builder>|CommandCooldownData<Builder>|CommandInvalidArguments<Builder>|CommandMissingArguments<Builder>|CommandMissingMemberPermissions<Builder>|CommandMissingBotPermissions<Builder>;

export interface CommandHaltBaseData<Builder extends RecipleCommandBuilders> { executeData: Builder extends InteractionCommandBuilder ? RecipleInteractionCommandExecuteData : RecipleMessageCommandExecuteData }
export interface CommandErrorData<Builder extends RecipleCommandBuilders> extends CommandHaltBaseData<Builder> { reason: 'ERROR'; error: any; }
export interface CommandCooldownData<Builder extends RecipleCommandBuilders> extends CommandHaltBaseData<Builder>,CooledDownUser { reason: 'COOLDOWN'; }
export interface CommandInvalidArguments<Builder extends RecipleCommandBuilders> extends CommandHaltBaseData<Builder> { reason: 'INVALID_ARGUMENTS'; invalidArguments: MessageCommandOptionManager; }
export interface CommandMissingArguments<Builder extends RecipleCommandBuilders> extends CommandHaltBaseData<Builder> { reason: 'MISSING_ARGUMENTS'; missingArguments: MessageCommandOptionManager; }
export interface CommandMissingMemberPermissions<Builder extends RecipleCommandBuilders> extends CommandHaltBaseData<Builder> { reason: 'MISSING_MEMBER_PERMISSIONS'; }
export interface CommandMissingBotPermissions<Builder extends RecipleCommandBuilders> extends CommandHaltBaseData<Builder> { reason: 'MISSING_BOT_PERMISSIONS'; }
