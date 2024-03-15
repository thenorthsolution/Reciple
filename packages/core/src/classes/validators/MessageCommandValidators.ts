import { MessageCommandOptionValidators } from './MessageCommandOptionValidators';
import { MessageCommandBuilderData } from '../builders/MessageCommandBuilder';
import { BaseCommandValidators } from './BaseCommandValidators';

export class MessageCommandValidators extends BaseCommandValidators {
    public static name = MessageCommandValidators.s.string.lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(32).regex(/^[\p{Ll}\p{Lm}\p{Lo}\p{N}\p{sc=Devanagari}\p{sc=Thai}_-]+$/u);
    public static description = MessageCommandValidators.s.string.lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(100);
    public static aliases = MessageCommandValidators.name.array.optional;
    public static validate_options = MessageCommandValidators.s.boolean.optional;
    public static dm_permission = MessageCommandValidators.s.boolean.optional;
    public static allow_bot = MessageCommandValidators.s.boolean.optional;
    public static options = MessageCommandOptionValidators.MessageCommandOptionResolvable.array.optional;

    public static isValidName(name: unknown): asserts name is MessageCommandBuilderData['name'] {
        MessageCommandValidators.name.setValidationEnabled(MessageCommandValidators.isValidationEnabled).parse(name);
    }

    public static isValidDescription(description: unknown): asserts description is MessageCommandBuilderData['description'] {
        MessageCommandValidators.description.setValidationEnabled(MessageCommandValidators.isValidationEnabled).parse(description);
    }

    public static isValidAliases(aliases: unknown): asserts aliases is MessageCommandBuilderData['aliases'] {
        MessageCommandValidators.aliases.setValidationEnabled(MessageCommandValidators.isValidationEnabled).parse(aliases);
    }

    public static isValidValidateOptions(parseOptions: unknown): asserts parseOptions is MessageCommandBuilderData['validate_options'] {
        MessageCommandValidators.validate_options.setValidationEnabled(MessageCommandValidators.isValidationEnabled).parse(parseOptions);
    }

    public static isValidDMPermission(DMPermission: unknown): asserts DMPermission is MessageCommandBuilderData['dm_permission'] {
        MessageCommandValidators.dm_permission.setValidationEnabled(MessageCommandValidators.isValidationEnabled).parse(DMPermission);
    }

    public static isValidAllowBot(allowBot: unknown): asserts allowBot is MessageCommandBuilderData['allow_bot'] {
        MessageCommandValidators.allow_bot.setValidationEnabled(MessageCommandValidators.isValidationEnabled).parse(allowBot);
    }

    public static isValidOptions(options: unknown): asserts options is MessageCommandBuilderData['options'] {
        MessageCommandValidators.options.setValidationEnabled(MessageCommandValidators.isValidationEnabled).parse(options);
    }
}
