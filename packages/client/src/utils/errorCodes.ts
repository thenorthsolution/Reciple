import { RecipleErrorOptions } from '../classes/errors/RecipleError';
import { getCommandBuilderName } from '../utils/functions';
import { AnyCommandBuilder, AnyCommandData } from '../types/commands';
import { realVersion } from './constants';
import kleur from 'kleur';

export function createUnknownCommandTypeErrorOptions(given: unknown): RecipleErrorOptions {
    return {
        message: `Unknown command type ${kleur.blue().bold(typeof given)}`,
        name: 'UnknownCommandType'
    };
}

export function createCommandExecuteErrorOptions(builder: AnyCommandBuilder|AnyCommandData, cause: unknown): RecipleErrorOptions {
    return {
        message: `An error occured while executing a ${kleur.cyan(getCommandBuilderName(builder))} named ${kleur.red("'" + builder.name + "'")}`,
        cause,
        name: 'CommandExecuteError'
    };
}

export function createCommandHaltErrorOptions(builder: AnyCommandBuilder|AnyCommandData, cause: unknown): RecipleErrorOptions {
    return {
        message: `An error occured while executing the halt function of a ${kleur.cyan(getCommandBuilderName(builder))} named ${kleur.red("'" + builder.name + "'")}`,
        cause,
        name: 'CommandHaltError'
    };
}

export function createLoadModuleFailErrorOptions(moduleDisplayName: string, cause: unknown): RecipleErrorOptions {
    return {
        message: `Failed to load ${kleur.red("'" + moduleDisplayName + "'")}`,
        cause,
        name: 'LoadModuleFail'
    };
}

export function createUnsupportedModuleErrorOptions(moduleDisplayName: string): RecipleErrorOptions {
    return {
        message: `The module ${kleur.red("'" + moduleDisplayName + "'")} does not support reciple client ${kleur.blue().bold(realVersion)}`,
        name: 'UnsupportedModule'
    };
}
