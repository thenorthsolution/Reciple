import { BaseCommandBuilderData } from '../builders/BaseCommandBuilder';
import { CommandType } from '../../types/constants';
import { Validators } from './Validators';
import { s } from '@sapphire/shapeshift';

export class BaseCommandValidators extends Validators {
    public static command_type = s.nativeEnum(CommandType);
    public static cooldown = s.number.finite.positive.lessThanOrEqual(2147483647).optional;
    public static required_bot_permissions = BaseCommandValidators.permissionResolvable.optional;
    public static required_member_permissions = BaseCommandValidators.permissionResolvable.optional;
    public static preconditions = s.string.array.optional;
    public static halt = s.instance(Function).optional;
    public static execute = s.instance(Function);

    public static BaseCommandBuilderData = s.object({
        command_type: BaseCommandValidators.command_type,
        cooldown: BaseCommandValidators.cooldown,
        required_bot_permissions: BaseCommandValidators.required_bot_permissions,
        required_member_permissions: BaseCommandValidators.required_member_permissions,
        preconditions: BaseCommandValidators.preconditions,
        halt: BaseCommandValidators.halt,
        execute: BaseCommandValidators.execute,
    });

    public static isValidCommandType(command_type: unknown): asserts command_type is BaseCommandBuilderData['command_type'] {
        BaseCommandValidators.command_type.setValidationEnabled(BaseCommandValidators.isValidationEnabled).parse(command_type);
    }

    public static isValidCooldown(cooldown: unknown): asserts cooldown is BaseCommandBuilderData['cooldown'] {
        BaseCommandValidators.cooldown.setValidationEnabled(BaseCommandValidators.isValidationEnabled).parse(cooldown);
    }

    public static isValidRequiredBotPermissions(permissions: unknown): asserts permissions is BaseCommandBuilderData['required_bot_permissions'] {
        BaseCommandValidators.required_bot_permissions.setValidationEnabled(BaseCommandValidators.isValidationEnabled).parse(permissions);
    }

    public static isValidRequiredMemberPermissions(permissions: unknown): asserts permissions is BaseCommandBuilderData['required_member_permissions'] {
        BaseCommandValidators.required_member_permissions.setValidationEnabled(BaseCommandValidators.isValidationEnabled).parse(permissions);
    }

    public static isValidPreconditions(preconditions: unknown): asserts preconditions is BaseCommandBuilderData['preconditions'] {
        BaseCommandValidators.preconditions.setValidationEnabled(BaseCommandValidators.isValidationEnabled).parse(preconditions);
    }

    public static isValidHalt(halt: unknown): asserts halt is BaseCommandBuilderData['halt'] {
        BaseCommandValidators.halt.setValidationEnabled(BaseCommandValidators.isValidationEnabled()).parse(halt);
    }

    public static isValidExecute(execute: unknown): asserts execute is BaseCommandBuilderData['execute'] {
        BaseCommandValidators.execute.setValidationEnabled(BaseCommandValidators.isValidationEnabled()).parse(execute);
    }

    public static isValidBaseCommandBuilderData(data: unknown): asserts data is BaseCommandBuilderData {
        const cmd = data as BaseCommandBuilderData;

        BaseCommandValidators.isValidCommandType(cmd.command_type);
        BaseCommandValidators.isValidCooldown(cmd.cooldown);
        BaseCommandValidators.isValidRequiredBotPermissions(cmd.required_bot_permissions);
        BaseCommandValidators.isValidRequiredMemberPermissions(cmd.required_member_permissions);
        BaseCommandValidators.isValidPreconditions(cmd.preconditions);
        BaseCommandValidators.isValidHalt(cmd.halt);
        BaseCommandValidators.isValidExecute(cmd.execute);
    }
}
