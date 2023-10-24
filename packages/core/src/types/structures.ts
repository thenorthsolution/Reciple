import { Awaitable, ClientOptions, Collection, Guild, Message, SlashCommandAttachmentOption, SlashCommandBooleanOption, SlashCommandChannelOption, SlashCommandIntegerOption, SlashCommandMentionableOption, SlashCommandNumberOption, SlashCommandRoleOption, SlashCommandStringOption, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandUserOption } from 'discord.js';
import { ContextMenuCommandBuilder, ContextMenuCommandBuilderData, ContextMenuCommandExecuteData, ContextMenuCommandExecuteFunction, ContextMenuCommandHaltData, ContextMenuCommandHaltFunction, ContextMenuCommandResolvable } from '../classes/builders/ContextMenuCommandBuilder';
import { MessageCommandBuilder, MessageCommandBuilderData, MessageCommandExecuteData, MessageCommandExecuteFunction, MessageCommandExecuteOptions, MessageCommandHaltData, MessageCommandHaltFunction, MessageCommandResolvable } from '../classes/builders/MessageCommandBuilder';
import { AnySlashCommandBuilder, SlashCommandBuilderData, SlashCommandExecuteData, SlashCommandExecuteFunction, SlashCommandHaltData, SlashCommandHaltFunction, SlashCommandResolvable } from '../classes/builders/SlashCommandBuilder';
import { CommandPreconditionResolvable, CommandPreconditionTriggerData } from '../classes/structures/CommandPrecondition';
import { MessageCommandOptionValue } from '../classes/structures/MessageCommandOptionValue';
import { CooldownSweeperOptions } from '../classes/managers/CooldownManager';
import { CommandHaltReason, CommandType } from './constants';
import { Cooldown } from '../classes/structures/Cooldown';

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
export type AnyCommandHaltData = ContextMenuCommandHaltData|MessageCommandHaltData|SlashCommandHaltData;
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
export type CommandHaltData<T extends CommandType> =
    | CommandErrorHaltData<T>
    | CommandCooldownHaltData<T>
    | (T extends CommandType.MessageCommand ? CommandInvalidArgumentsHaltData<T> | CommandMissingArgumentsHaltData<T> : never)
    | CommandPreconditionTriggerHaltData<T>;

export interface BaseCommandHaltData<T extends CommandType> {
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

export interface CommandErrorHaltData<T extends CommandType> extends BaseCommandHaltData<T> {
    reason: CommandHaltReason.Error;
    error: any;
}

export interface CommandCooldownHaltData<T extends CommandType> extends BaseCommandHaltData<T> {
    reason: CommandHaltReason.Cooldown;
    cooldown: Cooldown;
}

export interface CommandInvalidArgumentsHaltData<T extends CommandType> extends BaseCommandHaltData<T> {
    reason: CommandHaltReason.InvalidArguments;
    invalidOptions: Collection<string, MessageCommandOptionValue>;
}

export interface CommandMissingArgumentsHaltData<T extends CommandType> extends BaseCommandHaltData<T> {
    reason: CommandHaltReason.MissingArguments;
    missingOptions: Collection<string, MessageCommandOptionValue>;
}

export interface CommandPreconditionTriggerHaltData<T extends CommandType> extends BaseCommandHaltData<T>, Omit<CommandPreconditionTriggerData, 'executeData'> {
    reason: CommandHaltReason.PreconditionTrigger;
}

// SOmething
export interface CommandData {
    name?: string;
    prefix?: string;
    args: string[];
    raw: string;
    separator: string;
}
