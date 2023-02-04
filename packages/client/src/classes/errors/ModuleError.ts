import { RestOrArray, normalizeArray } from 'discord.js';
import { BaseError, ErrorType } from './BaseError';

export const ModuleErrorCodes = {
    'LoadModuleFail': 'Failed to load module "%0%": %1%',
    'UnsupportedModule': 'module "%0%" does not support Reciple %1%',
    'InvalidScript': 'Invalid Reciple module script',
    'NoSupportedVersions': 'Module script is missing the required (versions: string|string[]) property',
    'InvalidOnStartEvent': 'Module script\'s (onStart(): boolean|Promise<boolean>) method is not a valid function',
    'InvalidOnLoadEvent': 'Module script\'s (onLoad(): void|Promise<void>) method is not a valid function',
    'InvalidOnUnloadEvent': 'Module script\'s (onUnload(): void|Promise<void>) method is not a valid function'
}

export type ModuleErrorCodes = typeof ModuleErrorCodes;

export class ModuleError extends BaseError<ModuleErrorCodes> {
    readonly type: ErrorType.ModuleError = ErrorType.ModuleError;

    constructor(code: keyof ModuleErrorCodes, ...placeholders: RestOrArray<string>) {
        super(code, ModuleErrorCodes, ...normalizeArray(placeholders));
    }
}
