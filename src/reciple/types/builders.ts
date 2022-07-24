import { InteractionCommandBuilder, InteractionCommandExecuteData } from '../classes/builders/InteractionCommandBuilder';
import { MessageCommandBuilder, MessageCommandExecuteData } from '../classes/builders/MessageCommandBuilder';

/**
 * Reciple command builders
 */
export type RecipleCommandBuilder = MessageCommandBuilder|InteractionCommandBuilder;
/**
 * Reciple command builders execute data
 */
export type RecipleCommandBuildersExecuteData = InteractionCommandExecuteData|MessageCommandExecuteData;

/**
 * Types of Reciple command builders
 */
export enum RecipleCommandBuilderType {
    MessageCommand,
    InteractionCommand
}
