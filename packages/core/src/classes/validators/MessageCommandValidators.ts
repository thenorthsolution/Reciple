import { MessageCommandOptionValidators } from './MessageCommandOptionValidators';
import { MessageCommandBuilderData } from '../builders/MessageCommandBuilder';
import { BaseCommandValidators } from './BaseCommandValidators';

export class MessageCommandValidators extends BaseCommandValidators {
    public static name = MessageCommandValidators.s
        .string({ message: 'Expected string as message command name' })
        .lengthGreaterThanOrEqual(1, { message: 'Message command name needs to have at least single character' })
        .lengthLessThanOrEqual(32, { message: 'Message command name cannot exceed 32 characters' })
        .regex(/^[\p{Ll}\p{Lm}\p{Lo}\p{N}\p{sc=Devanagari}\p{sc=Thai}_-]+$/u, { message: 'Message command name can only be alphanumeric without spaces' });

    public static description = MessageCommandValidators.s
        .string({ message: 'Expected string as message command description' })
        .lengthGreaterThanOrEqual(1, { message: 'Message command description needs to have at least single character' })
        .lengthLessThanOrEqual(100, { message: 'Message command description cannot exceed 100 characters' });

    public static aliases = MessageCommandValidators.name
        .array({ message: 'Aliases are array of strings' })
        .optional();

    public static validate_options = MessageCommandValidators.s
        .boolean({ message: 'Expected boolean for .validate_options' })
        .optional();

    public static dm_permission = MessageCommandValidators.s
        .boolean({ message: 'Expected boolean for .dm_permission' })
        .optional();

    public static allow_bot = MessageCommandValidators.s
        .boolean({ message: 'Expected boolean for .allow_bot' })
        .optional();

    public static options = MessageCommandOptionValidators.MessageCommandOptionResolvable
        .array({ message: 'Expected an array for message command options' })
        .optional();

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
