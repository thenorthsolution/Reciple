import { s } from '@sapphire/shapeshift';
import { BitField, PermissionFlagsBits, PermissionsBitField, isValidationEnabled } from 'discord.js';

export class Validators {
    protected static _isValidationEnabled: boolean|null = null;

    protected constructor() {}

    public static isValidationEnabled(): boolean {
        return Validators._isValidationEnabled ?? isValidationEnabled();
    }

    public static setEnableValidation(enabled: boolean|null): boolean {
        Validators._isValidationEnabled = enabled;
        return Validators.isValidationEnabled();
    }

    public static permissionStringPredicate = s.enum<keyof typeof PermissionFlagsBits>(...(Object.keys(PermissionFlagsBits) as (keyof typeof PermissionFlagsBits)[]));
    public static permissionResolvable = s.union(
        s.instance(PermissionsBitField),
        s.instance(BitField),
        Validators.permissionStringPredicate.array,
        Validators.permissionStringPredicate,
        s.bigint,
        s.bigint.array
    );

    public static jsonEncodable = s.object({
        toJSON: s.instance(Function)
    });
}
