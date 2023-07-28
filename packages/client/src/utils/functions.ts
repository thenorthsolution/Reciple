import { SlashCommandAttachmentOption, SlashCommandBooleanOption, SlashCommandChannelOption, SlashCommandIntegerOption, SlashCommandMentionableOption, SlashCommandNumberOption, SlashCommandRoleOption, SlashCommandStringOption, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandUserOption } from 'discord.js';
import { AnyCommandBuilder, AnyCommandData, CommandType } from '../types/commands';
import { AnySlashCommandOptionBuilder } from '../types/slashCommandOptions';

export { replacePlaceholders, recursiveDefaults, RecursiveDefault  } from '@reciple/utils';

/**
 * Get the name of a command builder.
 * @param command The command builder to get the name of.
 */
export function getCommandBuilderName(command: AnyCommandBuilder|AnyCommandData|CommandType): keyof typeof CommandType {
    command = typeof command === 'number' ? command : command.commandType;

    switch (command) {
        case CommandType.ContextMenuCommand:
            return 'ContextMenuCommand';
        case CommandType.MessageCommand:
            return 'MessageCommand';
        case CommandType.SlashCommand:
            return 'SlashCommand';
    }
}

export function isSlashCommandOption(data: any): data is AnySlashCommandOptionBuilder|SlashCommandSubcommandBuilder|SlashCommandSubcommandGroupBuilder {
    return data instanceof SlashCommandAttachmentOption ||
    data instanceof SlashCommandBooleanOption ||
    data instanceof SlashCommandChannelOption ||
    data instanceof SlashCommandIntegerOption ||
    data instanceof SlashCommandMentionableOption ||
    data instanceof SlashCommandNumberOption ||
    data instanceof SlashCommandRoleOption ||
    data instanceof SlashCommandStringOption ||
    data instanceof SlashCommandUserOption ||
    data instanceof SlashCommandSubcommandBuilder ||
    data instanceof SlashCommandSubcommandGroupBuilder;
}
