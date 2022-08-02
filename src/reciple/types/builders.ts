import { MessageCommandBuilder, MessageCommandExecuteData, MessageCommandHaltData, MessageCommandHaltFunction } from '../classes/builders/MessageCommandBuilder';
import { SlashCommandBuilder, SlashCommandExecuteData, SlashCommandHaltData, SlashCommandHaltFunction } from '../classes/builders/SlashCommandBuilder';
import { Awaitable } from 'discord.js';

/**
 * Any Reciple command builders
 */
export type AnyCommandBuilder = SlashCommandBuilder|MessageCommandBuilder;
/**
 * Any Reciple command execute data
 */
export type AnyCommandExecuteData = SlashCommandExecuteData|MessageCommandExecuteData;

/**
 * Any Reciple command halt functions
 */
export type AnyCommandHaltFunction = SlashCommandHaltFunction|MessageCommandHaltFunction;

/**
 * Reciple command halt function
 */
export type CommandHaltFunction<T extends CommandBuilderType> = (haltData: T extends CommandBuilderType.SlashCommand ? SlashCommandHaltData : MessageCommandHaltData) => Awaitable<boolean|null|undefined|void>;

/**
 * Reciple command execute function
 */
export type CommandExecuteFunction<T extends CommandBuilderType> = (executeData: T extends CommandBuilderType.SlashCommand ? SlashCommandExecuteData : MessageCommandExecuteData) => Awaitable<void>;

/**
 * Types of Reciple command builders
 */
export enum CommandBuilderType {
    MessageCommand,
    SlashCommand
}
