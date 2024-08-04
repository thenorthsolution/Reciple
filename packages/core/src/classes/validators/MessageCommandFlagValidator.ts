import type { MessageCommandFlagBuilderData, MessageCommandFlagResolvable } from '../builders/MessageCommandFlagBuilder.js';
import { BaseCommandValidators } from './BaseCommandValidators.js';
import { isJSONEncodable } from 'discord.js';

export class MessageCommandFlagValidators extends BaseCommandValidators {
    public static name = MessageCommandFlagValidators.s
        .string({ message: 'Expected string as message command flag name' })
        .lengthGreaterThanOrEqual(1, { message: 'Message command flag name needs to have at least single character' })
        .lengthLessThanOrEqual(32, { message: 'Message command flag name cannot exceed 32 characters' })
        .regex(/^[\p{Ll}\p{Lm}\p{Lo}\p{N}\p{sc=Devanagari}\p{sc=Thai}_-]+$/u, { message: 'Message command flag name can only be alphanumeric without spaces' });

    public static short = MessageCommandFlagValidators.s
        .string({ message: 'Expected string as message command flag short' })
        .lengthEqual(1, { message: 'Message command flag short needs to have at least single character' })
        .optional();

    public static description = MessageCommandFlagValidators.s
        .string({ message: 'Expected string as message command flag description' })
        .lengthGreaterThanOrEqual(1, { message: 'Message command flag description needs to have at least single character' })
        .lengthLessThanOrEqual(100, { message: 'Message command flag description cannot exceed 100 characters' });

    public static default_values = MessageCommandFlagValidators.s
        .union([
            MessageCommandFlagValidators.s
                .string({ message: 'Expected string as message command flag default value' })
                .array({ message: 'Expected array as message command flag default values' }),
            MessageCommandFlagValidators.s
                .boolean({ message: 'Expected boolean as message command flag default value' })
                .array({ message: 'Expected array as message command flag default values' }),
        ])
        .optional();

    public static required = MessageCommandFlagValidators.s
        .boolean({ message: 'Expected boolean for .required' })
        .optional();

    public static mandatory = MessageCommandFlagValidators.s
        .boolean({ message: 'Expected boolean for .mandatory' })
        .optional();

    public static multiple = MessageCommandFlagValidators.s
        .boolean({ message: 'Expected boolean for .multiple' })
        .optional();

    public static validate = MessageCommandFlagValidators.s
        .instance(Function, { message: 'Expected a function for .validate' })
        .optional();

    public static resolve_value = MessageCommandFlagValidators.s
        .instance(Function, { message: 'Expected a function for .resolve_value' })
        .optional();

    public static MessageCommandFlagBuilderData = MessageCommandFlagValidators.s.object({
        name: MessageCommandFlagValidators.name,
        short: MessageCommandFlagValidators.short,
        description: MessageCommandFlagValidators.description,
        default_values: MessageCommandFlagValidators.default_values,
        required: MessageCommandFlagValidators.required,
        multiple: MessageCommandFlagValidators.multiple,
        validate: MessageCommandFlagValidators.validate,
        resolve_value: MessageCommandFlagValidators.resolve_value
    });

    public static MessageCommandFlagResolvable = MessageCommandFlagValidators.s.union([MessageCommandFlagValidators.MessageCommandFlagBuilderData, MessageCommandFlagValidators.jsonEncodable]);

    public static isValidName(name: unknown): asserts name is MessageCommandFlagBuilderData['name'] {
        MessageCommandFlagValidators.name.setValidationEnabled(MessageCommandFlagValidators.isValidationEnabled).parse(name);
    }

    public static isValidShort(short: unknown): asserts short is MessageCommandFlagBuilderData['short'] {
        MessageCommandFlagValidators.short.setValidationEnabled(MessageCommandFlagValidators.isValidationEnabled).parse(short);
    }

    public static isValidDescription(description: unknown): asserts description is MessageCommandFlagBuilderData['description'] {
        MessageCommandFlagValidators.description.setValidationEnabled(MessageCommandFlagValidators.isValidationEnabled).parse(description);
    }

    public static isValidDefaultValues(defaultValues: unknown): asserts defaultValues is MessageCommandFlagBuilderData['default_values'] {
        MessageCommandFlagValidators.default_values.setValidationEnabled(MessageCommandFlagValidators.isValidationEnabled).parse(defaultValues);
    }

    public static isValidRequired(required: unknown): asserts required is MessageCommandFlagBuilderData['required'] {
        MessageCommandFlagValidators.required.setValidationEnabled(MessageCommandFlagValidators.isValidationEnabled).parse(required);
    }

    public static isValidMandatory(mandatory: unknown): asserts mandatory is MessageCommandFlagBuilderData['mandatory'] {
        MessageCommandFlagValidators.mandatory.setValidationEnabled(MessageCommandFlagValidators.isValidationEnabled).parse(mandatory);
    }

    public static isValidMultiple(multiple: unknown): asserts multiple is MessageCommandFlagBuilderData['multiple'] {
        MessageCommandFlagValidators.multiple.setValidationEnabled(MessageCommandFlagValidators.isValidationEnabled).parse(multiple);
    }

    public static isValidValidate(validate: unknown): asserts validate is MessageCommandFlagBuilderData['validate'] {
        MessageCommandFlagValidators.validate.setValidationEnabled(MessageCommandFlagValidators.isValidationEnabled).parse(validate);
    }

    public static isValidResolveValue(resolveValue: unknown): asserts resolveValue is MessageCommandFlagBuilderData['resolve_value'] {
        MessageCommandFlagValidators.resolve_value.setValidationEnabled(MessageCommandFlagValidators.isValidationEnabled).parse(resolveValue);
    }

    public static isValidMessageCommandFlagBuilderData(data: unknown): asserts data is MessageCommandFlagBuilderData {
        const opt = data as MessageCommandFlagBuilderData;

        MessageCommandFlagValidators.isValidName(opt.name);
        MessageCommandFlagValidators.isValidShort(opt.short);
        MessageCommandFlagValidators.isValidDescription(opt.description);
        MessageCommandFlagValidators.isValidDefaultValues(opt.default_values);
        MessageCommandFlagValidators.isValidRequired(opt.required);
        MessageCommandFlagValidators.isValidMandatory(opt.mandatory);
        MessageCommandFlagValidators.isValidMultiple(opt.multiple);
        MessageCommandFlagValidators.isValidValidate(opt.validate);
        MessageCommandFlagValidators.isValidResolveValue(opt.resolve_value);
    }

    public static isValidMessageCommandFlagResolvable(data: unknown): asserts data is MessageCommandFlagResolvable {
        const opt = data as MessageCommandFlagResolvable;

        if (isJSONEncodable(opt)) {
            const i = opt.toJSON();
            MessageCommandFlagValidators.isValidMessageCommandFlagBuilderData(i);
        } else {
            MessageCommandFlagValidators.isValidMessageCommandFlagBuilderData(opt);
        }
    }
}
