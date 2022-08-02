import { Awaitable } from 'discord.js';
import { MessageCommandBuilder, MessageCommandExecuteData } from '../classes/builders/MessageCommandBuilder';
import { SlashCommandBuilder, SlashCommandExecuteData } from '../classes/builders/SlashCommandBuilder';
import { CommandHaltData } from './commands';

/**
 * Reciple command builders
 */
export type CommandBuilder = MessageCommandBuilder|SlashCommandBuilder;
/**
 * Reciple command execute data
 */
export type CommandExecuteData = SlashCommandExecuteData|MessageCommandExecuteData;

/**
 * Reciple command halt function
 */
export type CommandHaltFunction<T extends CommandBuilderType> = (haltData: CommandHaltData<T>) => Awaitable<boolean|null|undefined|void>;

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
