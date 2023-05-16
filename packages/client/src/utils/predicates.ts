import { s } from '@sapphire/shapeshift';
import { isValidationEnabled } from 'discord.js';
import { ContextMenuCommandBuilder } from '../classes/builders/ContextMenuCommandBuilder';
import { MessageCommandBuilder } from '../classes/builders/MessageCommandBuilder';
import { SlashCommandBuilder } from '../classes/builders/SlashCommandBuilder';
import { CommandType } from '../types/commands';

export const commandNamePredicate = s.string
    .lengthGreaterThanOrEqual(1)
    .lengthLessThanOrEqual(32)
    .regex(/^[\p{Ll}\p{Lm}\p{Lo}\p{N}\p{sc=Devanagari}\p{sc=Thai}_-]+$/u)
    .setValidationEnabled(isValidationEnabled);

export const contextMenuCommandNamePredicate = s.string
    .lengthGreaterThanOrEqual(1)
    .lengthLessThanOrEqual(32)
    .regex(/^( *[\p{P}\p{L}\p{N}\p{sc=Devanagari}\p{sc=Thai}]+ *)+$/u)
    .setValidationEnabled(isValidationEnabled)

export const commandDescriptionPredicate = s.string
    .lengthGreaterThanOrEqual(1)
    .lengthLessThanOrEqual(100)
    .setValidationEnabled(isValidationEnabled);

export const anyCommandBuilderPredicate = s.union(
        s.instance(ContextMenuCommandBuilder),
        s.instance(MessageCommandBuilder),
        s.instance(SlashCommandBuilder)
    ).setValidationEnabled(isValidationEnabled);

/**
 * TODO: Validate all command properties
 */
export const anyCommandDataPredicate = s.object({
    commandType: s.nativeEnum(CommandType),
    name: s.union(commandNamePredicate, contextMenuCommandNamePredicate),
    description: commandDescriptionPredicate
});

export const stringOrArrayOfStringPredicate = s.union(s.string, s.string.array);
