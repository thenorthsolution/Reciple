import { s } from '@sapphire/shapeshift';
import { BitField, PermissionFlagsBits, PermissionsBitField, isValidationEnabled } from 'discord.js';

export class Validators {
    protected static _isValidationEnabled: boolean|null = null;

    protected constructor() {}

    public static isValidationEnabled(): boolean {
        return this._isValidationEnabled ?? isValidationEnabled();
    }

    public static setEnableValidation(enabled: boolean|null): boolean {
        this._isValidationEnabled = enabled;
        return this.isValidationEnabled();
    }

    public static permissionStringPredicate = s.enum<keyof typeof PermissionFlagsBits>(...(Object.keys(PermissionFlagsBits) as (keyof typeof PermissionFlagsBits)[]));
    public static permissionResolvable = s.union(
        s.instance(PermissionsBitField),
        s.instance(BitField),
        this.permissionStringPredicate.array,
        this.permissionStringPredicate,
        s.bigint,
        s.bigint.array
    );

    public static jsonEncodable = s.object({
        toJSON: s.instance(Function)
    });
}
