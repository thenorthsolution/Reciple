import { RecipleErrorOptions } from '../classes/errors/RecipleError';
import { getCommandBuilderName } from '../utils/functions';
import { AnyCommandBuilder, AnyCommandData } from '../types/commands';
import { realVersion } from './constants';

export function createUnknownCommandTypeErrorOptions(given: unknown): RecipleErrorOptions {
    return {
        message: `Unknown command type: ${typeof given}`,
        name: 'UnknownCommandType'
    };
}

export function createCommandExecuteErrorOptions(builder: AnyCommandBuilder|AnyCommandData, cause: unknown): RecipleErrorOptions {
    return {
        message: `An error occured while executing the ${getCommandBuilderName(builder)} '${builder.name}'`,
        cause,
        name: 'CommandExecuteError'
    };
}

export function createCommandHaltErrorOptions(builder: AnyCommandBuilder|AnyCommandData, cause: unknown): RecipleErrorOptions {
    return {
        message: `An error occured while executing the ${getCommandBuilderName(builder)} '${builder.name}''s halt function`,
        cause,
        name: 'CommandHaltError'
    };
}

export function createLoadModuleFailErrorOptions(moduleDisplayName: string, cause: unknown): RecipleErrorOptions {
    return {
        message: `Failed to load '${moduleDisplayName}'`,
        cause,
        name: 'LoadModuleFail'
    };
}

export function createUnsupportedModuleErrorOptions(moduleDisplayName: string): RecipleErrorOptions {
    return {
        message: `The module '${moduleDisplayName}' does not support reciple client ${realVersion}`,
        name: 'UnsupportedModule'
    };
}
