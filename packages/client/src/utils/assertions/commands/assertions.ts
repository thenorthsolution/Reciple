import { PermissionResolvable } from 'discord.js';
import { AnyCommandBuilder, AnyCommandData, AnyCommandExecuteFunction, CommandType } from '../../../types/commands';
import { CommandAssertions } from '../../../classes/assertions/CommandAssertions';

// TODO: Remove this file

/**
 * @deprecated Use `CommandAssertions` static methods instead
 */
export function validateCommandType(commandType: unknown): asserts commandType is CommandType {
    CommandAssertions.validateCommand(commandType);
};

/**
 * @deprecated Use `CommandAssertions` static methods instead
 */
export function validateCommandCooldown(cooldown: unknown): asserts cooldown is number {
    CommandAssertions.validateCommandCooldown(cooldown);
};

/**
 * @deprecated Use `CommandAssertions` static methods instead
 */
export function validateCommandRequiredBotPermissions(permissions: unknown): asserts permissions is PermissionResolvable {
    CommandAssertions.validateCommandRequiredBotPermissions(permissions);
};

/**
 * @deprecated Use `CommandAssertions` static methods instead
 */
export function validateCommandRequiredMemberPermissions(permissions: unknown): asserts permissions is PermissionResolvable {
    CommandAssertions.validateCommandRequiredMemberPermissions(permissions);
};

/**
 * @deprecated Use `CommandAssertions` static methods instead
 */
export function validateCommandExecute(execute: unknown): asserts execute is AnyCommandExecuteFunction {
    CommandAssertions.validateCommandExecute(execute);
};

/**
 * @deprecated Use `CommandAssertions` static methods instead
 */
export function validateCommandHalt(halt: unknown): asserts halt is AnyCommandExecuteFunction {
    CommandAssertions.validateCommandHalt(halt);
};

/**
 * @deprecated Use `CommandAssertions` static methods instead
 */
export function validateCommand(command: unknown): asserts command is (AnyCommandData|AnyCommandBuilder) {
    CommandAssertions.validateCommand(command);
};
