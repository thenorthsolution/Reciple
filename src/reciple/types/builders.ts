import { MessageCommandBuilder, MessageCommandExecuteData, MessageCommandExecuteFunction, MessageCommandHaltData, MessageCommandHaltFunction } from '../classes/builders/MessageCommandBuilder';
import { SlashCommandBuilder, SlashCommandExecuteData, SlashCommandExecuteFunction, SlashCommandHaltData, SlashCommandHaltFunction } from '../classes/builders/SlashCommandBuilder';
import { Awaitable, PermissionResolvable, RestOrArray } from 'discord.js';

/**
 * Any command builders
 */
export type AnyCommandBuilder = SlashCommandBuilder|MessageCommandBuilder;

/**
 * Any command halt functions
 */
export type AnyCommandHaltFunction = SlashCommandHaltFunction|MessageCommandHaltFunction;

/**
 * Any command execute function
 */
export type AnyCommandExecuteFunction = SlashCommandExecuteFunction|MessageCommandExecuteFunction;

/**
 * command halt function
 */
export type CommandHaltFunction<T extends CommandBuilderType> = (haltData: T extends CommandBuilderType.SlashCommand ? SlashCommandHaltData : MessageCommandHaltData) => Awaitable<boolean|null|undefined|void>;

/**
 * command execute function
 */
export type CommandExecuteFunction<T extends CommandBuilderType> = (executeData: T extends CommandBuilderType.SlashCommand ? SlashCommandExecuteData : MessageCommandExecuteData) => Awaitable<void>;

/**
 * Types of command builders
 */
export enum CommandBuilderType {
    MessageCommand,
    SlashCommand
}


/**
 * Shared command builder methods
 */
export interface SharedCommandBuilderProperties {
    readonly type: CommandBuilderType;
    cooldown: number;
    requiredBotPermissions: PermissionResolvable[];
    requiredMemberPermissions: PermissionResolvable[];
    allowExecuteInDM: boolean;
    halt?: AnyCommandHaltFunction;
    execute: AnyCommandExecuteFunction;

    /**
     * Sets the execute cooldown for this command.
     * - `0` means no cooldown
     * @param cooldown Command cooldown in milliseconds
     */
    setCooldown(cooldown: number): this;

    /**
     * Set required bot permissions to execute the command
     * @param permissions Bot's required permissions
     */
    setRequiredBotPermissions(...permissions: RestOrArray<PermissionResolvable>): this;

    /**
     * Set required permissions to execute the command
     * @param permissions User's return permissions
     */
    setRequiredMemberPermissions(...permissions: RestOrArray<PermissionResolvable>): this;

    /**
     * Function when the command is interupted 
     * @param halt Function to execute when command is halted
     */
    setHalt(halt?: this["halt"]): this;

    /**
     * Function when the command is executed 
     * @param execute Function to execute when the command is called 
     */
    setExecute(execute: this["execute"]): this;
}
