import { BitField, PermissionFlagsBits, PermissionsBitField, isValidationEnabled } from 'discord.js';
import { MessageCommandOptionBuilder } from '../../../classes/builders/MessageCommandOptionBuilder';
import { ContextMenuCommandBuilder } from '../../../classes/builders/ContextMenuCommandBuilder';
import { SlashCommandBuilder } from '../../../classes/builders/SlashCommandBuilder';
import { CommandType } from '../../../types/commands';
import { s } from '@sapphire/shapeshift';

export const anyCommandBuilderPredicate = s.union(
        s.instance(ContextMenuCommandBuilder),
        s.instance(MessageCommandOptionBuilder),
        s.instance(SlashCommandBuilder)
    ).setValidationEnabled(isValidationEnabled);

export const permissionStringPredicate = s.enum<keyof typeof PermissionFlagsBits>(...(Object.keys(PermissionFlagsBits) as (keyof typeof PermissionFlagsBits)[]));

export const permissionResolvablePredicate = s.union(
        s.instance(PermissionsBitField),
        s.instance(BitField),
        permissionStringPredicate.array,
        permissionStringPredicate,
        s.bigint,
        s.bigint.array
    ).setValidationEnabled(isValidationEnabled);

export const slashOrMessageCommandNamePredicate = s.string
    .lengthGreaterThanOrEqual(1)
    .lengthLessThanOrEqual(32)
    .regex(/^[\p{Ll}\p{Lm}\p{Lo}\p{N}\p{sc=Devanagari}\p{sc=Thai}_-]+$/u)
    .setValidationEnabled(isValidationEnabled);

export const contextMenuCommandNamePredicate = s.string
    .lengthGreaterThanOrEqual(1)
    .lengthLessThanOrEqual(32)
    .regex(/^( *[\p{P}\p{L}\p{N}\p{sc=Devanagari}\p{sc=Thai}]+ *)+$/u)
    .setValidationEnabled(isValidationEnabled);

export const commandOrOptionDescriptionPredicate = s.string
    .lengthGreaterThanOrEqual(1)
    .lengthLessThanOrEqual(100)
    .setValidationEnabled(isValidationEnabled);

export const baseCommandBuilderDataPredicate = s.object({
        commandType: s.nativeEnum(CommandType),
        cooldown: s.number.positive.finite.optional,
        requiredBotPermissions: permissionResolvablePredicate.optional,
        requiredMemberPermissions: permissionResolvablePredicate.optional,
        halt: s.instance(Function).optional,
        execute: s.instance(Function).optional,
    }).setValidationEnabled(isValidationEnabled);

export const commandResolvablePredicate = s.union(anyCommandBuilderPredicate, baseCommandBuilderDataPredicate);
