import { MessageCommandBuilder, MessageCommandExecuteData, MessageCommandHaltData } from '../classes/builders/MessageCommandBuilder';
import { SlashCommandBuilder, SlashCommandExecuteData, SlashCommandHaltData } from '../classes/builders/SlashCommandBuilder';
import { Awaitable } from 'discord.js';

/**
 * Reciple command builders
 */
export type AnyCommandBuilder = MessageCommandBuilder|SlashCommandBuilder;
/**
 * Reciple command execute data
 */
export type AnyCommandExecuteData = SlashCommandExecuteData|MessageCommandExecuteData;

/**
 * Reciple command halt function
 */
export type AnyCommandHaltFunction<T extends CommandBuilderType> = (haltData: T extends CommandBuilderType.SlashCommand ? SlashCommandHaltData : MessageCommandHaltData) => Awaitable<boolean|null|undefined|void>;

/**
 * Reciple command execute function
 */
export type AnyCommandExecuteFunction<T extends CommandBuilderType> = (executeData: T extends CommandBuilderType.SlashCommand ? SlashCommandExecuteData : MessageCommandExecuteData) => Awaitable<void>;

/**
 * Types of Reciple command builders
 */
export enum CommandBuilderType {
    MessageCommand,
    SlashCommand
}
