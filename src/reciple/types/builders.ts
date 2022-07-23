import { InteractionCommandBuilder, RecipleInteractionCommandExecuteData } from '../classes/builders/InteractionCommandBuilder';
import { MessageCommandBuilder, RecipleMessageCommandExecuteData } from '../classes/builders/MessageCommandBuilder';

export type RecipleCommandBuilder = MessageCommandBuilder|InteractionCommandBuilder;
export type RecipleCommandBuildersExecuteData = RecipleInteractionCommandExecuteData|RecipleMessageCommandExecuteData;

export enum RecipleCommandBuilderType {
    MessageCommand,
    InteractionCommand
}
