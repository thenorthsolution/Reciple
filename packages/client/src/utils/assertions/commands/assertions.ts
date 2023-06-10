import { PermissionResolvable, isValidationEnabled } from 'discord.js';
import { AnyCommandBuilder, AnyCommandData, AnyCommandExecuteFunction, CommandType } from '../../../types/commands';
import { permissionResolvablePredicate } from './predicates';
import { s } from '@sapphire/shapeshift';
import { BaseCommandBuilderData } from '../../..';

export function validateCommandType(commandType: unknown): asserts commandType is CommandType {
    s.nativeEnum(CommandType).setValidationEnabled(isValidationEnabled).parse(commandType);
}

export function validateCommandCooldown(cooldown: unknown): asserts cooldown is number {
    s.number.positive.finite.positive.optional.setValidationEnabled(isValidationEnabled).parse(cooldown);
}

export function validateCommandRequiredBotPermissions(permissions: unknown): asserts permissions is PermissionResolvable {
    permissionResolvablePredicate.optional.parse(permissions);
}

export function validateCommandRequiredMemberPermissions(permissions: unknown): asserts permissions is PermissionResolvable {
    permissionResolvablePredicate.optional.parse(permissions);
}

export function validateCommandExecute(execute: unknown): asserts execute is AnyCommandExecuteFunction {
    s.instance(Function).optional.setValidationEnabled(isValidationEnabled).parse(execute);
}

export function validateCommandHalt(halt: unknown): asserts halt is AnyCommandExecuteFunction {
    s.instance(Function).optional.setValidationEnabled(isValidationEnabled).parse(halt);
}

export function validateCommand(command: unknown): asserts command is (AnyCommandData|AnyCommandBuilder) {
    const cmd = command as Partial<BaseCommandBuilderData>;

    validateCommandType(cmd?.commandType);
    validateCommandCooldown(cmd?.commandType);
    validateCommandRequiredBotPermissions(cmd?.requiredBotPermissions);
    validateCommandRequiredMemberPermissions(cmd?.requiredMemberPermissions);
    validateCommandExecute(cmd?.execute);
    validateCommandHalt(cmd?.halt);
}
