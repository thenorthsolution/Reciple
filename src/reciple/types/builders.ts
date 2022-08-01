import { Awaitable } from 'discord.js';
import { MessageCommandBuilder, MessageCommandExecuteData } from '../classes/builders/MessageCommandBuilder';
import { SlashCommandBuilder, SlashCommandExecuteData } from '../classes/builders/SlashCommandBuilder';
import { HaltedCommandData } from './commands';

/**
 * Reciple command builders
 */
export type CommandBuilder = MessageCommandBuilder|SlashCommandBuilder;
/**
 * Reciple command builders execute data
 */
export type CommandBuilderExecuteData = SlashCommandExecuteData|MessageCommandExecuteData;

/**
 * Reciple command halt function
 */
export type CommandHaltFunction<Builder extends CommandBuilder> = (haltData: HaltedCommandData<Builder>) => Awaitable<boolean|null|undefined|void>;

/**
 * Reciple command execute function
 */
export type CommandExecuteFunction<Builder extends CommandBuilder> = (executeData: Builder extends MessageCommandBuilder ? MessageCommandExecuteData : SlashCommandExecuteData) => Awaitable<void>;

/**
 * Types of Reciple command builders
 */
export enum CommandBuilderType {
    MessageCommand,
    SlashCommand
}
