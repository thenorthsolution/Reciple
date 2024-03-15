import { MessageCommandOptionBuilderData, MessageCommandOptionResolvable } from '../builders/MessageCommandOptionBuilder';
import { BaseCommandValidators } from './BaseCommandValidators';
import { isJSONEncodable } from 'discord.js';

export class MessageCommandOptionValidators extends BaseCommandValidators {
    public static name = MessageCommandOptionValidators.s.string.lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(32).regex(/^[\p{Ll}\p{Lm}\p{Lo}\p{N}\p{sc=Devanagari}\p{sc=Thai}_-]+$/u);
    public static description = MessageCommandOptionValidators.s.string.lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(100);
    public static required = MessageCommandOptionValidators.s.boolean.optional;
    public static validate = MessageCommandOptionValidators.s.instance(Function).optional;
    public static resolve_value = MessageCommandOptionValidators.s.instance(Function).optional;

    public static MessageCommandOptionBuilderData = MessageCommandOptionValidators.s.object({
        name: MessageCommandOptionValidators.name,
        description: MessageCommandOptionValidators.description,
        required: MessageCommandOptionValidators.required,
        validate: MessageCommandOptionValidators.validate,
        resolve_value: MessageCommandOptionValidators.resolve_value
    });

    public static MessageCommandOptionResolvable = MessageCommandOptionValidators.s.union(MessageCommandOptionValidators.MessageCommandOptionBuilderData, MessageCommandOptionValidators.jsonEncodable);

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
