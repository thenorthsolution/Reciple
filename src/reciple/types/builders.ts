import { InteractionCommandBuilder, RecipleInteractionCommandExecuteData } from '../classes/builders/InteractionCommandBuilder';
import { MessageCommandBuilder, RecipleMessageCommandExecuteData } from '../classes/builders/MessageCommandBuilder';

/**
 * Reciple command builders
 */
export type RecipleCommandBuilder = MessageCommandBuilder|InteractionCommandBuilder;
/**
 * Reciple command builders execute data
 */
export type RecipleCommandBuildersExecuteData = RecipleInteractionCommandExecuteData|RecipleMessageCommandExecuteData;

/**
 * Types of Reciple command builders
 */
export enum RecipleCommandBuilderType {
    MessageCommand,
    InteractionCommand
}
