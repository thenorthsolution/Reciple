import { s } from '@sapphire/shapeshift';
import { AnyCommandBuilder, AnyCommandData, AnyCommandExecuteFunction, CommandType } from '../../types/commands';
import { PermissionResolvable, isValidationEnabled } from 'discord.js';
import { commandCooldownPredicate, permissionResolvablePredicate } from '../../utils/predicates';
import { BaseCommandBuilderData } from '../../classes/builders/BaseCommandBuilder';

export class CommandAssertions {
    public static validateCommandType(commandType: unknown): asserts commandType is CommandType {
        s.nativeEnum(CommandType).setValidationEnabled(isValidationEnabled).parse(commandType);
    }

    public static validateCommandCooldown(cooldown: unknown): asserts cooldown is number {
       commandCooldownPredicate.setValidationEnabled(isValidationEnabled).parse(cooldown);
    }

    public static validateCommandRequiredBotPermissions(permissions: unknown): asserts permissions is PermissionResolvable {
        permissionResolvablePredicate.optional.setValidationEnabled(isValidationEnabled).parse(permissions);
    }

    public static validateCommandRequiredMemberPermissions(permissions: unknown): asserts permissions is PermissionResolvable {
        permissionResolvablePredicate.optional.setValidationEnabled(isValidationEnabled).parse(permissions);
    }

    public static validateCommandExecute(execute: unknown): asserts execute is AnyCommandExecuteFunction {
        s.instance(Function).optional.setValidationEnabled(isValidationEnabled).parse(execute);
    }

    public static validateCommandHalt(halt: unknown): asserts halt is AnyCommandExecuteFunction {
        s.instance(Function).optional.setValidationEnabled(isValidationEnabled).parse(halt);
    }

    public static validateCommand(command: unknown): asserts command is (AnyCommandData|AnyCommandBuilder) {
        const cmd = command as Partial<BaseCommandBuilderData>;

        this.validateCommandType(cmd?.commandType);
        this.validateCommandCooldown(cmd?.commandType);
        this.validateCommandRequiredBotPermissions(cmd?.requiredBotPermissions);
        this.validateCommandRequiredMemberPermissions(cmd?.requiredMemberPermissions);
        this.validateCommandExecute(cmd?.execute);
        this.validateCommandHalt(cmd?.halt);
    }
}
