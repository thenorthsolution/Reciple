import { s } from '@sapphire/shapeshift';
import { BaseCommandValidators } from './BaseCommandValidators';

export class ContextMenuCommandValidators extends BaseCommandValidators {
    public static name = s.string.lengthGreaterThanOrEqual(1).lengthLessThanOrEqual(32);
}
