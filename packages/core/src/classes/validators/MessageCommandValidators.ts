import { s } from '@sapphire/shapeshift';
import { BaseCommandValidators } from './BaseCommandValidators';
import { MessageCommandBuilderData } from '../builders/MessageCommandBuilder';
import { MessageCommandOptionValidators } from './MessageCommandOptionValidators';

export class MessageCommandValidators extends BaseCommandValidators {
    public static name = s.string.lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(32).regex(/^[\p{Ll}\p{Lm}\p{Lo}\p{N}\p{sc=Devanagari}\p{sc=Thai}_-]+$/u);
    public static description = s.string.lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(100);
    public static aliases = this.name.array.optional;
    public static validate_options = s.boolean.optional;
    public static dm_permission = s.boolean.optional;
    public static allow_bot = s.boolean.optional;
    public static options = MessageCommandOptionValidators.MessageCommandOptionResolvable.array.optional;

    public static isValidName(name: unknown): asserts name is MessageCommandBuilderData['name'] {
        this.name.setValidationEnabled(this.isValidationEnabled).parse(name);
    }

    public static isValidDescription(description: unknown): asserts description is MessageCommandBuilderData['description'] {
        this.description.setValidationEnabled(this.isValidationEnabled).parse(description);
    }

    public static isValidAliases(aliases: unknown): asserts aliases is MessageCommandBuilderData['aliases'] {
        this.aliases.setValidationEnabled(this.isValidationEnabled).parse(aliases);
    }

    public static isValidValidateOptions(parseOptions: unknown): asserts parseOptions is MessageCommandBuilderData['validate_options'] {
        this.validate_options.setValidationEnabled(this.isValidationEnabled).parse(parseOptions);
    }

    public static isValidDMPermission(DMPermission: unknown): asserts DMPermission is MessageCommandBuilderData['dm_permission'] {
        this.dm_permission.setValidationEnabled(this.isValidationEnabled).parse(DMPermission);
    }

    public static isValidAllowBot(allowBot: unknown): asserts allowBot is MessageCommandBuilderData['allow_bot'] {
        this.allow_bot.setValidationEnabled(this.isValidationEnabled).parse(allowBot);
    }

    public static isValidOptions(options: unknown): asserts options is MessageCommandBuilderData['options'] {
        this.options.setValidationEnabled(this.isValidationEnabled).parse(options);
    }
}
