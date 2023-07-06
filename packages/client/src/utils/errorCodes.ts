import { AnyCommandBuilder, AnyCommandData } from '../types/commands';
import { RecipleErrorOptions } from '../classes/errors/RecipleError';
import { getCommandBuilderName } from '../utils/functions';
import { realVersion } from './constants';
import { kleur } from 'fallout-utility';

// TODO: Remove this file

/**
 * @deprecated Use `RecipleError` static methods instead
 */
export function createUnknownCommandTypeErrorOptions(given: unknown): RecipleErrorOptions {
    return {
        message: `Unknown command type ${kleur.blue().bold(typeof given)}`,
        name: 'UnknownCommandType'
    };
}

/**
 * @deprecated Use `RecipleError` static methods instead
 */
export function createCommandExecuteErrorOptions(builder: AnyCommandBuilder|AnyCommandData, cause: unknown): RecipleErrorOptions {
    return {
        message: `An error occured while executing a ${kleur.cyan(getCommandBuilderName(builder))} named ${kleur.red("'" + builder.name + "'")}`,
        cause,
        name: 'CommandExecuteError'
    };
}

/**
 * @deprecated Use `RecipleError` static methods instead
 */
export function createCommandHaltErrorOptions(builder: AnyCommandBuilder|AnyCommandData, cause: unknown): RecipleErrorOptions {
    return {
        message: `An error occured while executing the halt function of a ${kleur.cyan(getCommandBuilderName(builder))} named ${kleur.red("'" + builder.name + "'")}`,
        cause,
        name: 'CommandHaltError'
    };
}

/**
 * @deprecated Use `RecipleError` static methods instead
 */
export function createCommandPreconditionErrorOptions(builder: AnyCommandBuilder|AnyCommandData, cause: unknown): RecipleErrorOptions {
    return {
        message: `An error occured while executing precondition for ${kleur.cyan(getCommandBuilderName(builder))} named ${kleur.red("'" + builder.name + "'")}`,
        cause,
        name: 'PreconditionError'
    };
}

/**
 * @deprecated Use `RecipleError` static methods instead
 */
export function createCommandRequiredOptionNotFoundErrorOptions(optionName: string, value: unknown): RecipleErrorOptions {
    return {
        message: `No value given from required option ${kleur.cyan("'" + optionName + "'")}`,
        cause: { value },
        name: 'RequiredOptionNotFound'
    };
}

/**
 * @deprecated Use `RecipleError` static methods instead
 */
export function createLoadModuleFailErrorOptions(moduleDisplayName: string, cause: unknown): RecipleErrorOptions {
    return {
        message: `Failed to load ${kleur.red("'" + moduleDisplayName + "'")}`,
        cause,
        name: 'LoadModuleFail'
    };
}

/**
 * @deprecated Use `RecipleError` static methods instead
 */
export function createUnsupportedModuleErrorOptions(moduleDisplayName: string): RecipleErrorOptions {
    return {
        message: `The module ${kleur.red("'" + moduleDisplayName + "'")} does not support reciple client ${kleur.blue().bold(realVersion)}`,
        name: 'UnsupportedModule'
    };
}
