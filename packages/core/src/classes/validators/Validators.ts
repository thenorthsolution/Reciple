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

    public static permissionStringPredicate = Validators.s.enum<keyof typeof PermissionFlagsBits>(Object.keys(PermissionFlagsBits) as (keyof typeof PermissionFlagsBits)[]);
    public static permissionResolvable = Validators.s.union([
        Validators.s.instance(PermissionsBitField),
        Validators.s.instance(BitField),
        Validators.permissionStringPredicate.array(),
        Validators.permissionStringPredicate,
        Validators.s.bigint(),
        Validators.s.bigint().array()
    ]);

    public static commandPreconditionData = Validators.s.object({
        id: Validators.s.string().regex(/^[a-zA-Z0-9_.-]+$/),
        disabled: Validators.s.boolean().optional(),
        contextMenuCommandExecute: Validators.s.instance(Function).optional(),
        messageCommandExecute: Validators.s.instance(Function).optional(),
        slashCommandExecute: Validators.s.instance(Function).optional(),
    });

    public static commandHaltData = Validators.s.object({
        id: Validators.s.string().regex(/^[a-zA-Z0-9_.-]+$/),
        disabled: Validators.s.boolean().optional(),
        halt: Validators.s.instance(Function)
    });

    public static jsonEncodable = Validators.s.object({
        toJSON: Validators.s.instance(Function)
    });

    public static commandPreconditionResolvable = Validators.s.union([
        Validators.commandPreconditionData,
        Validators.jsonEncodable
    ]);

    public static commandHaltResolvabable = Validators.s.union([
        Validators.commandHaltData,
        Validators.jsonEncodable
    ]);
}
