import { RestOrArray, normalizeArray } from 'discord.js';
import { BaseError, ErrorType } from './BaseError';
import kleur from 'kleur';

// TODO: Remove this class

/**
 * @deprecated
 */
export const ModuleErrorCodes = {
    /**
     * @deprecated
     */
    LoadModuleFail: () => `Failed to load module ${kleur.blue('%0%')}:\n  ${kleur.red('%1%')}`,
    /**
     * @deprecated
     */
    UnsupportedModule: () => `module ${kleur.blue('%0%')} does not support Reciple ${kleur.green('%1%')}`,
    /**
     * @deprecated 
     */
    InvalidScript: () => 'Invalid Reciple module script',
    /**
     * @deprecated
     */
    NoSupportedVersions: () => `Module script is missing the required ${kleur.blue('(versions: string|string[])')} property`,
    /**
     * @deprecated
     */
    InvalidOnStartEvent: () => `Module script's ${kleur.blue('onStart(): boolean|Promise<boolean>')} method is not a valid function`,
    /**
     * @deprecated
     */
    InvalidOnLoadEvent: () => `Module script's ${kleur.blue('(onLoad(): void|Promise<void>)')} method is not a valid function`,
    /**
     * @deprecated
     */
    InvalidOnUnloadEvent: () => `Module script's ${kleur.blue('(onUnload(): void|Promise<void>)')} method is not a valid function`
}

/**
 * @deprecated
 */
export type ModuleErrorCodes = typeof ModuleErrorCodes;

/**
 * @deprecated
 */
export class ModuleError extends BaseError<ModuleErrorCodes> {
    readonly errorType: ErrorType.ModuleError = ErrorType.ModuleError;

    constructor(code: keyof ModuleErrorCodes, ...placeholders: RestOrArray<string>) {
        super(code, ModuleErrorCodes, ...normalizeArray(placeholders));
    }
}
