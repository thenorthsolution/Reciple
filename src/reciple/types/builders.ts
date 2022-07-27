import { MessageCommandBuilder, MessageCommandExecuteData } from '../classes/builders/MessageCommandBuilder';
import { SlashCommandBuilder, SlashCommandExecuteData } from '../classes/builders/SlashCommandBuilder';

/**
 * Reciple command builders
 */
export type CommandBuilder = MessageCommandBuilder|SlashCommandBuilder;
/**
 * Reciple command builders execute data
 */
export type CommandBuilderExecuteData = SlashCommandExecuteData|MessageCommandExecuteData;

/**
 * Types of Reciple command builders
 */
export enum CommandBuilderType {
    MessageCommand,
    SlashCommand
}
