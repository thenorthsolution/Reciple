import { AnyCommandBuilder, AnyCommandData } from '../types/commands';
import { RecipleError, RecipleErrorOptions } from '../classes/errors/RecipleError';

// TODO: Remove this file

/**
 * @deprecated Use `RecipleError` static methods instead
 */
export function createUnknownCommandTypeErrorOptions(given: unknown): RecipleErrorOptions {
    return RecipleError.createUnknownCommandTypeErrorOptions(given);
}

/**
 * @deprecated Use `RecipleError` static methods instead
 */
export function createCommandExecuteErrorOptions(builder: AnyCommandBuilder|AnyCommandData, cause: unknown): RecipleErrorOptions {
    return RecipleError.createCommandExecuteErrorOptions(builder, cause);
}

/**
 * @deprecated Use `RecipleError` static methods instead
 */
export function createCommandHaltErrorOptions(builder: AnyCommandBuilder|AnyCommandData, cause: unknown): RecipleErrorOptions {
    return RecipleError.createCommandHaltErrorOptions(builder, cause);
}

/**
 * @deprecated Use `RecipleError` static methods instead
 */
export function createCommandPreconditionErrorOptions(builder: AnyCommandBuilder|AnyCommandData, cause: unknown): RecipleErrorOptions {
    return RecipleError.createCommandPreconditionErrorOptions(builder, cause);
}

/**
 * @deprecated Use `RecipleError` static methods instead
 */
export function createCommandRequiredOptionNotFoundErrorOptions(optionName: string, value: unknown): RecipleErrorOptions {
    return RecipleError.createCommandRequiredOptionNotFoundErrorOptions(optionName, value);
}

/**
 * @deprecated Use `RecipleError` static methods instead
 */
export function createLoadModuleFailErrorOptions(moduleDisplayName: string, cause: unknown): RecipleErrorOptions {
    return RecipleError.createLoadModuleFailErrorOptions(moduleDisplayName, cause);
}

/**
 * @deprecated Use `RecipleError` static methods instead
 */
export function createUnsupportedModuleErrorOptions(moduleDisplayName: string): RecipleErrorOptions {
    return RecipleError.createUnsupportedModuleErrorOptions(moduleDisplayName);
}
