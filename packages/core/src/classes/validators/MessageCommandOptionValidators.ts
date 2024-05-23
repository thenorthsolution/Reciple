import { MessageCommandOptionBuilderData, MessageCommandOptionResolvable } from '../builders/MessageCommandOptionBuilder';
import { BaseCommandValidators } from './BaseCommandValidators';
import { isJSONEncodable } from 'discord.js';

export class MessageCommandOptionValidators extends BaseCommandValidators {
    public static name = MessageCommandOptionValidators.s
        .string({ message: 'Expected string as message command option name' })
        .lengthGreaterThanOrEqual(1, { message: 'Message command option name needs to have at least single character' })
        .lengthLessThanOrEqual(32, { message: 'Message command option name cannot exceed 32 characters' })
        .regex(/^[\p{Ll}\p{Lm}\p{Lo}\p{N}\p{sc=Devanagari}\p{sc=Thai}_-]+$/u, { message: 'Message command option name can only be alphanumeric without spaces' });

    public static description = MessageCommandOptionValidators.s
        .string({ message: 'Expected string as message command option description' })
        .lengthGreaterThanOrEqual(1, { message: 'Message command option description needs to have at least single character' })
        .lengthLessThanOrEqual(100, { message: 'Message command option description cannot exceed 100 characters' });

    public static required = MessageCommandOptionValidators.s
        .boolean({ message: 'Expected boolean for .required' })
        .optional();

    public static validate = MessageCommandOptionValidators.s
        .instance(Function, { message: 'Expected a function for .validate' })
        .optional();

    public static resolve_value = MessageCommandOptionValidators.s
        .instance(Function, { message: 'Expected a function for .resolve_value' })
        .optional();

    public static MessageCommandOptionBuilderData = MessageCommandOptionValidators.s.object({
        name: MessageCommandOptionValidators.name,
        description: MessageCommandOptionValidators.description,
        required: MessageCommandOptionValidators.required,
        validate: MessageCommandOptionValidators.validate,
        resolve_value: MessageCommandOptionValidators.resolve_value
    });

    public static MessageCommandOptionResolvable = MessageCommandOptionValidators.s.union([MessageCommandOptionValidators.MessageCommandOptionBuilderData, MessageCommandOptionValidators.jsonEncodable]);

    public static isValidName(name: unknown): asserts name is MessageCommandOptionBuilderData['name'] {
        MessageCommandOptionValidators.name.setValidationEnabled(MessageCommandOptionValidators.isValidationEnabled).parse(name);
    }

    public static isValidDescription(description: unknown): asserts description is MessageCommandOptionBuilderData['description'] {
        MessageCommandOptionValidators.description.setValidationEnabled(MessageCommandOptionValidators.isValidationEnabled).parse(description);
    }

    public static isValidRequired(required: unknown): asserts required is MessageCommandOptionBuilderData['required'] {
        MessageCommandOptionValidators.required.setValidationEnabled(MessageCommandOptionValidators.isValidationEnabled).parse(required);
    }

    public static isValidValidate(validate: unknown): asserts validate is MessageCommandOptionBuilderData['validate'] {
        MessageCommandOptionValidators.validate.setValidationEnabled(MessageCommandOptionValidators.isValidationEnabled).parse(validate);
    }

    public static isValidResolveValue(resolveValue: unknown): asserts resolveValue is MessageCommandOptionBuilderData['resolve_value'] {
        MessageCommandOptionValidators.resolve_value.setValidationEnabled(MessageCommandOptionValidators.isValidationEnabled).parse(resolveValue);
    }

    public static isValidMessageCommandOptionBuilderData(data: unknown): asserts data is MessageCommandOptionBuilderData {
        const opt = data as MessageCommandOptionBuilderData;

        MessageCommandOptionValidators.isValidName(opt.name);
        MessageCommandOptionValidators.isValidDescription(opt.description);
        MessageCommandOptionValidators.isValidRequired(opt.required);
        MessageCommandOptionValidators.isValidValidate(opt.validate);
        MessageCommandOptionValidators.isValidResolveValue(opt.resolve_value);
    }

    public static isValidMessageCommandOptionResolvable(data: unknown): asserts data is MessageCommandOptionResolvable {
        const opt = data as MessageCommandOptionResolvable;

        if (isJSONEncodable(opt)) {
            const i = opt.toJSON();
            MessageCommandOptionValidators.isValidMessageCommandOptionBuilderData(i);
        } else {
            MessageCommandOptionValidators.isValidMessageCommandOptionBuilderData(opt);
        }
    }
}
