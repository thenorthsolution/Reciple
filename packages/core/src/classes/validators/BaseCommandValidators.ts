import type { CommandPreconditionResolvable } from '../structures/CommandPrecondition.js';
import type { BaseCommandBuilderData } from '../builders/BaseCommandBuilder.js';
import { type RestOrArray, normalizeArray } from 'discord.js';
import { CommandType } from '../../types/constants.js';
import { Validators } from './Validators.js';

export class BaseCommandValidators extends Validators {
    public static command_type = BaseCommandValidators.s
        .nativeEnum(CommandType, { message: 'Expected an enum for .command_type' });

    public static cooldown = BaseCommandValidators.s
        .number({ message: 'Expected number for .cooldown' })
        .finite({ message: 'Command cooldowns only accepts finite values' })
        .positive({ message: 'Command cooldowns only accepts positive number' })
        .lessThanOrEqual(2147483647, { message: 'Command cooldown exceeded safe integer limit' })
        .nullish();

    public static required_bot_permissions = BaseCommandValidators.permissionResolvable
        .optional();

    public static required_member_permissions = BaseCommandValidators.permissionResolvable
        .optional();

    public static preconditions = Validators.commandPreconditionResolvable
        .array({ message: 'Expected an array of preconditions for .preconditions' });

    public static halts = BaseCommandValidators.commandHaltResolvabable
        .array({ message: 'Expected an array for .halts' })
        .optional();

    public static execute = BaseCommandValidators.s
        .instance(Function, { message: 'Expected a function for .execute' });

    public static BaseCommandBuilderData = BaseCommandValidators.s.object({
        command_type: BaseCommandValidators.command_type,
        cooldown: BaseCommandValidators.cooldown,
        required_bot_permissions: BaseCommandValidators.required_bot_permissions,
        required_member_permissions: BaseCommandValidators.required_member_permissions,
        preconditions: BaseCommandValidators.preconditions,
        halts: BaseCommandValidators.halts,
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
        BaseCommandValidators.s.any().array().setValidationEnabled(BaseCommandValidators.isValidationEnabled).parse(preconditions);

        const data = normalizeArray(preconditions as RestOrArray<CommandPreconditionResolvable>);

        for (const precondition of data) {
            BaseCommandValidators.preconditions.setValidationEnabled(BaseCommandValidators.isValidationEnabled).parse(precondition);
        }
    }

    public static isValidDisabledPreconditions(preconditions: unknown): asserts preconditions is BaseCommandBuilderData['disabled_preconditions'] {
        BaseCommandValidators.s.any().array().setValidationEnabled(BaseCommandValidators.isValidationEnabled).parse(preconditions);

        const data = normalizeArray(preconditions as RestOrArray<CommandPreconditionResolvable>);

        for (const precondition of data) {
            Validators.s.union([
                Validators.commandPreconditionResolvable,
                Validators.s.string()
            ]).setValidationEnabled(BaseCommandValidators.isValidationEnabled).parse(precondition);
        }
    }

    public static isValidHalts(halts: unknown): asserts halts is BaseCommandBuilderData['halts'] {
        BaseCommandValidators.halts.setValidationEnabled(BaseCommandValidators.isValidationEnabled()).parse(halts);
    }

    public static isValidDisabledHalts(halts: unknown): asserts halts is BaseCommandBuilderData['disabled_halts'] {
        BaseCommandValidators.s.any().array().setValidationEnabled(BaseCommandValidators.isValidationEnabled).parse(halts);

        const data = normalizeArray(halts as RestOrArray<CommandPreconditionResolvable>);

        for (const precondition of data) {
            Validators.s.union([
                Validators.commandHaltResolvabable,
                Validators.s.string()
            ]).setValidationEnabled(BaseCommandValidators.isValidationEnabled).parse(precondition);
        }
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
        BaseCommandValidators.isValidDisabledPreconditions(cmd.disabled_preconditions);
        BaseCommandValidators.isValidHalts(cmd.halts);
        BaseCommandValidators.isValidDisabledHalts(cmd.disabled_halts);
        BaseCommandValidators.isValidExecute(cmd.execute);
    }
}
