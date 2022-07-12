import { InteractionCommandBuilder, RecipleInteractionCommandExecuteData } from '../classes/builders/InteractionCommandBuilder';
import { MessageCommandBuilder, RecipleMessageCommandExecuteData } from '../classes/builders/MessageCommandBuilder';

export type RecipleCommandBuilders = MessageCommandBuilder|InteractionCommandBuilder;
export type RecipleCommandBuildersExecuteData = RecipleInteractionCommandExecuteData|RecipleMessageCommandExecuteData;
