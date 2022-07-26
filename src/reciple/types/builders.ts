import { MessageCommandBuilder, MessageCommandExecuteData } from '../classes/builders/MessageCommandBuilder';
import { SlashCommandBuilder, SlashCommandExecuteData } from '../classes/builders/SlashCommandBuilder';

/**
 * Reciple command builders
 */
export type RecipleCommandBuilder = MessageCommandBuilder|SlashCommandBuilder;
/**
 * Reciple command builders execute data
 */
export type RecipleCommandBuildersExecuteData = SlashCommandExecuteData|MessageCommandExecuteData;

/**
 * Types of Reciple command builders
 */
export enum RecipleCommandBuilderType {
    MessageCommand,
    SlashCommand
}
