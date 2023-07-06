import { stripVTControlCharacters } from 'node:util';
import { kleur } from 'fallout-utility';
import { AnyCommandBuilder, AnyCommandData } from '../../types/commands';
import { getCommandBuilderName } from '../../utils/functions';
import { realVersion } from '../../utils/constants';

export interface RecipleErrorOptions {
    message: string;
    name?: string;
    cause?: unknown;
}

export class RecipleError extends Error {
    get cleanStack() { return this.stack && stripVTControlCharacters(this.stack); }

    constructor(options: RecipleErrorOptions|string) {
        options = typeof options === 'string' ? { message: options } : options;

        super(options.message, { ...options });

        if (options.name) this.name = kleur.bold().red(options.name);
    }

    public toString() {
        return stripVTControlCharacters(super.toString());
    }

    public static createUnknownCommandTypeErrorOptions(given: unknown): RecipleErrorOptions {
        return {
            message: `Unknown command type ${kleur.blue().bold(typeof given)}`,
            name: 'UnknownCommandType'
        };
    }

    public static createCommandExecuteErrorOptions(builder: AnyCommandBuilder|AnyCommandData, cause: unknown): RecipleErrorOptions {
        return {
            message: `An error occured while executing a ${kleur.cyan(getCommandBuilderName(builder))} named ${kleur.red("'" + builder.name + "'")}`,
            cause,
            name: 'CommandExecuteError'
        };
    }

    public static createCommandHaltErrorOptions(builder: AnyCommandBuilder|AnyCommandData, cause: unknown): RecipleErrorOptions {
        return {
            message: `An error occured while executing the halt function of a ${kleur.cyan(getCommandBuilderName(builder))} named ${kleur.red("'" + builder.name + "'")}`,
            cause,
            name: 'CommandHaltError'
        };
    }

    public static createCommandPreconditionErrorOptions(builder: AnyCommandBuilder|AnyCommandData, cause: unknown): RecipleErrorOptions {
        return {
            message: `An error occured while executing precondition for ${kleur.cyan(getCommandBuilderName(builder))} named ${kleur.red("'" + builder.name + "'")}`,
            cause,
            name: 'PreconditionError'
        };
    }

    public static createCommandRequiredOptionNotFoundErrorOptions(optionName: string, value: unknown): RecipleErrorOptions {
        return {
            message: `No value given from required option ${kleur.cyan("'" + optionName + "'")}`,
            cause: { value },
            name: 'RequiredOptionNotFound'
        };
    }

    public static createLoadModuleFailErrorOptions(moduleDisplayName: string, cause: unknown): RecipleErrorOptions {
        return {
            message: `Failed to load ${kleur.red("'" + moduleDisplayName + "'")}`,
            cause,
            name: 'LoadModuleFail'
        };
    }

    public static createUnsupportedModuleErrorOptions(moduleDisplayName: string): RecipleErrorOptions {
        return {
            message: `The module ${kleur.red("'" + moduleDisplayName + "'")} does not support reciple client ${kleur.blue().bold(realVersion)}`,
            name: 'UnsupportedModule'
        };
    }
}
