import { RestOrArray, normalizeArray } from 'discord.js';
import { BaseError, ErrorType } from './BaseError';
import kleur from 'kleur';

export const ModuleErrorCodes = {
    'LoadModuleFail': () => `Failed to load module ${kleur.blue('%0%')}:\n  %1%`,
    'UnsupportedModule': () => `module ${kleur.blue('%0%')} does not support Reciple ${kleur.green('%1%')}`,
    'InvalidScript': () => 'Invalid Reciple module script',
    'NoSupportedVersions': () => `Module script is missing the required ${kleur.blue('(versions: string|string[])')} property`,
    'InvalidOnStartEvent': () => `Module script's ${kleur.blue('onStart(): boolean|Promise<boolean>')} method is not a valid function`,
    'InvalidOnLoadEvent': () => `Module script's ${kleur.blue('(onLoad(): void|Promise<void>)')} method is not a valid function`,
    'InvalidOnUnloadEvent': () => `Module script's ${kleur.blue('(onUnload(): void|Promise<void>)')} method is not a valid function`
}

export type ModuleErrorCodes = typeof ModuleErrorCodes;

export class ModuleError extends BaseError<ModuleErrorCodes> {
    readonly errorType: ErrorType.ModuleError = ErrorType.ModuleError;

    constructor(code: keyof ModuleErrorCodes, ...placeholders: RestOrArray<string>) {
        super(code, ModuleErrorCodes, ...normalizeArray(placeholders));
    }
}
