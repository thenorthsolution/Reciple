import { BitField, PermissionFlagsBits, PermissionsBitField, isValidationEnabled } from 'discord.js';
import { Shapes, s } from '@sapphire/shapeshift';

export class Validators {
    protected static readonly s: Shapes = s;

    protected static _isValidationEnabled: boolean|null = null;

    protected constructor() {}

    public static isValidationEnabled(): boolean {
        return Validators._isValidationEnabled ?? isValidationEnabled();
    }

    public static setEnableValidation(enabled: boolean|null): boolean {
        Validators._isValidationEnabled = enabled;
        return Validators.isValidationEnabled();
    }

    public static permissionStringPredicate = this.s.enum<keyof typeof PermissionFlagsBits>(...(Object.keys(PermissionFlagsBits) as (keyof typeof PermissionFlagsBits)[]));
    public static permissionResolvable = this.s.union(
        this.s.instance(PermissionsBitField),
        this.s.instance(BitField),
        Validators.permissionStringPredicate.array,
        Validators.permissionStringPredicate,
        this.s.bigint,
        this.s.bigint.array
    );

    public static jsonEncodable = this.s.object({
        toJSON: this.s.instance(Function)
    });
}
