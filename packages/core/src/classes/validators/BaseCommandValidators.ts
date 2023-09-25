import { s } from '@sapphire/shapeshift';
import { Validators } from './Validators';
import { CommandType } from '../../types/constants';
import { BaseCommandBuilderData } from '../builders/BaseCommandBuilder';

export class BaseCommandValidators extends Validators {
    public static command_type = s.nativeEnum(CommandType);
    public static cooldown = s.number.finite.positive.lessThanOrEqual(2147483647).optional;
    public static required_bot_permissions = this.permissionResolvable.optional;
    public static required_member_permissions = this.permissionResolvable.optional;
    public static preconditions = s.string.array.optional;
    public static halt = s.instance(Function).optional;
    public static execute = s.instance(Function);

    public static baseCommandBuilderData = s.object({
        command_type: this.command_type,
        cooldown: this.cooldown,
        required_bot_permissions: this.required_bot_permissions,
        required_member_permissions: this.required_member_permissions,
        preconditions: this.preconditions,
        halt: this.halt,
        execute: this.execute,
    });

    public static isValidCommandType(command_type: unknown): asserts command_type is BaseCommandBuilderData['command_type'] {
        this.command_type.setValidationEnabled(this.isValidationEnabled).parse(command_type);
    }

    public static isValidCooldown(cooldown: unknown): asserts cooldown is BaseCommandBuilderData['cooldown'] {
        this.cooldown.setValidationEnabled(this.isValidationEnabled).parse(cooldown);
    }

    public static isValidRequiredBotPermissions(permissions: unknown): asserts permissions is BaseCommandBuilderData['required_bot_permissions'] {
        this.required_bot_permissions.setValidationEnabled(this.isValidationEnabled).parse(permissions);
    }

    public static isValidRequiredMemberPermissions(permissions: unknown): asserts permissions is BaseCommandBuilderData['required_member_permissions'] {
        this.required_member_permissions.setValidationEnabled(this.isValidationEnabled).parse(permissions);
    }

    public static isValidPreconditions(preconditions: unknown): asserts preconditions is BaseCommandBuilderData['preconditions'] {
        this.preconditions.setValidationEnabled(this.isValidationEnabled).parse(preconditions);
    }

    public static isValidHalt(halt: unknown): asserts halt is BaseCommandBuilderData['halt'] {
        this.halt.setValidationEnabled(this.isValidationEnabled()).parse(halt);
    }

    public static isValidExecute(execute: unknown): asserts execute is BaseCommandBuilderData['execute'] {
        this.execute.setValidationEnabled(this.isValidationEnabled()).parse(execute);
    }

    public static isValidBaseCommandBuilderData(data: unknown): asserts data is BaseCommandBuilderData {
        const cmd = data as BaseCommandBuilderData;

        this.isValidCommandType(cmd.command_type);
        this.isValidCooldown(cmd.cooldown);
        this.isValidRequiredBotPermissions(cmd.required_bot_permissions);
        this.isValidRequiredMemberPermissions(cmd.required_member_permissions);
        this.isValidPreconditions(cmd.preconditions);
        this.isValidHalt(cmd.halt);
        this.isValidExecute(cmd.execute);
    }
}
