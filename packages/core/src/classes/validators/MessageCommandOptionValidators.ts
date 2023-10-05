import { s } from '@sapphire/shapeshift';
import { BaseCommandValidators } from './BaseCommandValidators';
import { MessageCommandOptionBuilderData, MessageCommandOptionResolvable } from '../builders/MessageCommandOptionBuilder';
import { isJSONEncodable } from 'discord.js';

export class MessageCommandOptionValidators extends BaseCommandValidators {
    public static name = s.string.lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(32).regex(/^[\p{Ll}\p{Lm}\p{Lo}\p{N}\p{sc=Devanagari}\p{sc=Thai}_-]+$/u);
    public static description = s.string.lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(100);
    public static required = s.boolean.optional;
    public static validate = s.instance(Function).optional;
    public static resolve_value = s.instance(Function).optional;

    public static MessageCommandOptionBuilderData = s.object({
        name: this.name,
        description: this.description,
        required: this.required,
        validate: this.validate,
        resolve_value: this.resolve_value
    });

    public static MessageCommandOptionResolvable = s.union(MessageCommandOptionValidators.MessageCommandOptionBuilderData, this.jsonEncodable);

    public static isValidName(name: unknown): asserts name is MessageCommandOptionBuilderData['name'] {
        this.name.setValidationEnabled(this.isValidationEnabled).parse(name);
    }

    public static isValidDescription(description: unknown): asserts description is MessageCommandOptionBuilderData['description'] {
        this.description.setValidationEnabled(this.isValidationEnabled).parse(description);
    }

    public static isValidRequired(required: unknown): asserts required is MessageCommandOptionBuilderData['required'] {
        this.required.setValidationEnabled(this.isValidationEnabled).parse(required);
    }

    public static isValidValidate(validate: unknown): asserts validate is MessageCommandOptionBuilderData['validate'] {
        this.validate.setValidationEnabled(this.isValidationEnabled).parse(validate);
    }

    public static isValidResolveValue(resolveValue: unknown): asserts resolveValue is MessageCommandOptionBuilderData['resolve_value'] {
        this.resolve_value.setValidationEnabled(this.isValidationEnabled).parse(resolveValue);
    }

    public static isValidMessageCommandOptionBuilderData(data: unknown): asserts data is MessageCommandOptionBuilderData {
        const opt = data as MessageCommandOptionBuilderData;

        this.isValidName(opt.name);
        this.isValidDescription(opt.description);
        this.isValidRequired(opt.required);
        this.isValidValidate(opt.validate);
        this.isValidResolveValue(opt.resolve_value);
    }

    public static isValidMessageCommandOptionResolvable(data: unknown): asserts data is MessageCommandOptionResolvable {
        const opt = data as MessageCommandOptionResolvable;

        if (isJSONEncodable(opt)) {
            const i = opt.toJSON();
            this.isValidMessageCommandOptionBuilderData(i);
        } else {
            this.isValidMessageCommandOptionBuilderData(opt);
        }
    }
}
