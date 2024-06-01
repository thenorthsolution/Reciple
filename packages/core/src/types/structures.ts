import { Awaitable, ClientOptions, Collection, Guild, Message, SlashCommandAttachmentOption, SlashCommandBooleanOption, SlashCommandChannelOption, SlashCommandIntegerOption, SlashCommandMentionableOption, SlashCommandNumberOption, SlashCommandRoleOption, SlashCommandStringOption, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandUserOption } from 'discord.js';
import { ContextMenuCommandBuilder, ContextMenuCommandBuilderData, ContextMenuCommandExecuteData, ContextMenuCommandExecuteFunction, ContextMenuCommandHaltTriggerData, ContextMenuCommandHaltFunction, ContextMenuCommandResolvable } from '../classes/builders/ContextMenuCommandBuilder.js';
import { MessageCommandBuilder, MessageCommandBuilderData, MessageCommandExecuteData, MessageCommandExecuteFunction, MessageCommandExecuteOptions, MessageCommandHaltTriggerData, MessageCommandHaltFunction, MessageCommandResolvable } from '../classes/builders/MessageCommandBuilder.js';
import { AnySlashCommandBuilder, SlashCommandBuilderData, SlashCommandExecuteData, SlashCommandExecuteFunction, SlashCommandHaltTriggerData, SlashCommandHaltFunction, SlashCommandResolvable } from '../classes/builders/SlashCommandBuilder.js';
import { CommandPreconditionResolvable, CommandPreconditionResultData } from '../classes/structures/CommandPrecondition.js';
import { MessageCommandOptionValue } from '../classes/structures/MessageCommandOptionValue.js';
import { CooldownSweeperOptions } from '../classes/managers/CooldownManager.js';
import { CommandHaltReason, CommandType } from './constants.js';
import { Cooldown } from '../classes/structures/Cooldown.js';
import { CommandHaltResolvable, CommandHaltResultData } from '../classes/structures/CommandHalt.js';

// Config
export interface RecipleClientConfig {
    token: string;
    commands?: {
        contextMenuCommand?: Partial<RecipleClientInteractionBasedCommandConfigOptions>;
        messageCommand?: Partial<RecipleClientCommandConfigOptions> & {
            commandArgumentSeparator?: string|((message: Omit<MessageCommandExecuteOptions, 'message'> & { message?: Message; guild?: Guild|null; }) => Awaitable<string>);
            prefix?: string|((message: Omit<MessageCommandExecuteOptions, 'message'> & { message?: Message; guild?: Guild|null; }) => Awaitable<string>);
        };
        slashCommand?: Partial<RecipleClientInteractionBasedCommandConfigOptions>;
    };
    applicationCommandRegister?: {
        enabled: boolean;
        registerToGuilds?: string[];
        allowRegisterGlobally?: boolean;
        allowRegisterToGuilds?: boolean;
        registerEmptyCommands?: boolean;
    };
    cooldownSweeperOptions?: CooldownSweeperOptions;
    preconditions?: CommandPreconditionResolvable[];
    commandHalts?: CommandHaltResolvable[];
    client: ClientOptions;
}

export interface RecipleClientCommandConfigOptions {
    enabled: boolean;
    enableCooldown: boolean;
}

export interface RecipleClientInteractionBasedCommandConfigOptions extends RecipleClientCommandConfigOptions {
    registerCommands: {
        registerGlobally: boolean;
        registerToGuilds: string[];
    };
    acceptRepliedInteractions: boolean;
}

// Any types
export type AnyCommandBuilderData = ContextMenuCommandBuilderData|MessageCommandBuilderData|SlashCommandBuilderData;
export type AnyCommandBuilder = ContextMenuCommandBuilder|MessageCommandBuilder|AnySlashCommandBuilder;
export type AnyCommandResolvable = ContextMenuCommandResolvable|MessageCommandResolvable|SlashCommandResolvable;
export type AnyCommandHaltTriggerData = ContextMenuCommandHaltTriggerData|MessageCommandHaltTriggerData|SlashCommandHaltTriggerData;
export type AnyCommandHaltResultData = CommandHaltResultData<CommandType.ContextMenuCommand>|CommandHaltResultData<CommandType.MessageCommand>|CommandHaltResultData<CommandType.SlashCommand>;
export type AnyCommandHaltFunction = ContextMenuCommandHaltFunction|MessageCommandHaltFunction|SlashCommandHaltFunction;
export type AnyCommandExecuteData = ContextMenuCommandExecuteData|MessageCommandExecuteData|SlashCommandExecuteData;
export type AnyCommandExecuteFunction = ContextMenuCommandExecuteFunction|MessageCommandExecuteFunction|SlashCommandExecuteFunction;
export type AnyNonSubcommandSlashCommandOptionBuilder = SlashCommandAttachmentOption|SlashCommandBooleanOption|SlashCommandChannelOption|SlashCommandIntegerOption|SlashCommandMentionableOption|SlashCommandNumberOption|SlashCommandRoleOption|SlashCommandStringOption|SlashCommandUserOption;
export type AnySubcommandSlashCommandOptionBuilder = SlashCommandSubcommandBuilder|SlashCommandSubcommandGroupBuilder;
export type AnyNonSubcommandSlashCommandOptionData = ReturnType<AnyNonSubcommandSlashCommandOptionBuilder['toJSON']>;
export type AnySubcommandSlashCommandOptionData = ReturnType<AnySubcommandSlashCommandOptionBuilder['toJSON']>;
export type AnySlashCommandOptionBuilder = AnyNonSubcommandSlashCommandOptionBuilder|AnySubcommandSlashCommandOptionBuilder;
export type AnySlashCommandOptionData = AnyNonSubcommandSlashCommandOptionData|AnySubcommandSlashCommandOptionData;

// Command Halt
export type CommandHaltTriggerData<T extends CommandType> =
    | CommandErrorHaltTriggerData<T>
    | CommandCooldownHaltTriggerData<T>
    | (T extends CommandType.MessageCommand ? CommandInvalidArgumentsHaltTriggerData<T> | CommandMissingArgumentsHaltTriggerData<T> : never)
    | CommandPreconditionResultHaltTriggerData<T>;

export interface BaseCommandHaltTriggerData<T extends CommandType> {
    reason: CommandHaltReason;
    commandType: T;
    executeData: T extends CommandType.ContextMenuCommand
        ? ContextMenuCommandExecuteData
        : T extends CommandType.MessageCommand
            ? MessageCommandExecuteData
            : T extends CommandType.SlashCommand
                ? SlashCommandExecuteData
                : never;
}

export interface CommandErrorHaltTriggerData<T extends CommandType> extends BaseCommandHaltTriggerData<T> {
    reason: CommandHaltReason.Error;
    error: any;
}

export interface CommandCooldownHaltTriggerData<T extends CommandType> extends BaseCommandHaltTriggerData<T> {
    reason: CommandHaltReason.Cooldown;
    cooldown: Cooldown;
}

export interface CommandInvalidArgumentsHaltTriggerData<T extends CommandType> extends BaseCommandHaltTriggerData<T> {
    reason: CommandHaltReason.InvalidArguments;
    invalidOptions: Collection<string, MessageCommandOptionValue>;
}

export interface CommandMissingArgumentsHaltTriggerData<T extends CommandType> extends BaseCommandHaltTriggerData<T> {
    reason: CommandHaltReason.MissingArguments;
    missingOptions: Collection<string, MessageCommandOptionValue>;
}

export interface CommandPreconditionResultHaltTriggerData<T extends CommandType> extends BaseCommandHaltTriggerData<T>, Omit<CommandPreconditionResultData, 'executeData'> {
    reason: CommandHaltReason.PreconditionTrigger;
}

// SOmething
export interface CommandData {
    name?: string;
    prefix?: string;
    args: string[];
    raw: string;
    rawArgs: string;
    separator: string;
}
