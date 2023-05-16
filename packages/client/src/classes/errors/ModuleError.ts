import { RestOrArray, normalizeArray } from 'discord.js';
import { BaseError, ErrorType } from './BaseError';
import kleur from 'kleur';

export const ModuleErrorCodes = {
    LoadModuleFail: () => `Failed to load module ${kleur.blue('%0%')}:\n  ${kleur.red('%1%')}`,
    UnsupportedModule: () => `module ${kleur.blue('%0%')} does not support Reciple ${kleur.green('%1%')}`,
    UnableToAddCommand: () => `Unable to add command ${kleur.gray('%0%')} ${kleur.blue('%1%')}:\n  ${kleur.red('%2%')}`,

    /**
     * @deprecated This error code will be removed in favor of @sapphire/shapeshift's validation error
     */
    InvalidScript: () => 'Invalid Reciple module script',
    /**
     * @deprecated This error code will be removed in favor of @sapphire/shapeshift's validation error
     */
    NoSupportedVersions: () => `Module script is missing the required ${kleur.blue('(versions: string|string[])')} property`,
    /**
     * @deprecated This error code will be removed in favor of @sapphire/shapeshift's validation error
     */
    InvalidOnStartEvent: () => `Module script's ${kleur.blue('onStart(): boolean|Promise<boolean>')} method is not a valid function`,
    /**
     * @deprecated This error code will be removed in favor of @sapphire/shapeshift's validation error
     */
    InvalidOnLoadEvent: () => `Module script's ${kleur.blue('(onLoad(): void|Promise<void>)')} method is not a valid function`,
    /**
     * @deprecated This error code will be removed in favor of @sapphire/shapeshift's validation error
     */
    InvalidOnUnloadEvent: () => `Module script's ${kleur.blue('(onUnload(): void|Promise<void>)')} method is not a valid function`
}

export type ModuleErrorCodes = typeof ModuleErrorCodes;

export class ModuleError extends BaseError<ModuleErrorCodes> {
    readonly errorType: ErrorType.ModuleError = ErrorType.ModuleError;

    constructor(code: keyof ModuleErrorCodes, ...placeholders: RestOrArray<string>) {
        super(code, ModuleErrorCodes, ...normalizeArray(placeholders));
    }
}
