import type { AnyCommandBuilder, AnyCommandBuilderData } from '../../types/structures.js';
import type { BaseCommandBuilderData } from '../builders/BaseCommandBuilder.js';
import { buildVersion } from '../../types/constants.js';
import { stripVTControlCharacters } from 'node:util';
import { kleur } from 'fallout-utility/strings';
import { Utils } from './Utils.js';

export interface RecipleErrorOptions {
    message: string;
    name?: string;
    cause?: unknown;
}

export class RecipleError extends Error {
    get cleanStack() { return this.stack && stripVTControlCharacters(this.stack); }

    constructor(options: RecipleErrorOptions|string) {
        options = typeof options === 'string' ? { message: options } : options;
        if ('cause' in options) options.cause = ['string', 'boolean', 'number', 'symbol', 'bigint'].includes(typeof options.cause) ? new RecipleError(String(options.cause)) : options.cause;

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

    public static createCommandExecuteErrorOptions(builder: AnyCommandBuilder|AnyCommandBuilderData, cause: unknown): RecipleErrorOptions {
        return {
            message: `An error occured while executing a ${kleur.cyan(Utils.getCommandTypeName(builder.command_type))} named ${kleur.red("'" + builder.name + "'")}`,
            cause,
            name: 'CommandExecuteError'
        };
    }

    public static createCommandHaltErrorOptions(builder: BaseCommandBuilderData & { name: string; }, cause: unknown): RecipleErrorOptions {
        return {
            message: `An error occured while executing the halt function of a ${kleur.cyan(Utils.getCommandTypeName(builder.command_type))} named ${kleur.red("'" + builder.name + "'")}`,
            cause,
            name: 'CommandHaltError'
        };
    }

    public static createCommandPreconditionErrorOptions(builder: BaseCommandBuilderData & { name: string; }, cause: unknown): RecipleErrorOptions {
        return {
            message: `An error occured while executing precondition for ${kleur.cyan(Utils.getCommandTypeName(builder.command_type))} named ${kleur.red("'" + builder.name + "'")}`,
            cause,
            name: 'PreconditionError'
        };
    }

    public static createCommandRequiredOptionNotFoundErrorOptions(optionName: string, value: unknown): RecipleErrorOptions {
        return {
            message: `No value given for required option ${kleur.cyan("'" + optionName + "'")}`,
            cause: { value },
            name: 'RequiredOptionNotFound'
        };
    }

    public static createCommandRequiredFlagNotFoundErrorOptions(flagName: string, value: unknown): RecipleErrorOptions {
        return {
            message: `No value given for required flag ${kleur.cyan("'" + flagName + "'")}`,
            cause: { value },
            name: 'RequiredOptionNotFound'
        };
    }

    public static createCommandMandatoryFlagNotFoundErrorOptions(flagName: string, value: unknown): RecipleErrorOptions {
        return {
            message: `No value given for mandatory flag ${kleur.cyan("'" + flagName + "'")}`,
            cause: { value },
            name: 'RequiredOptionNotFound'
        };
    }

    public static createStartModuleErrorOptions(moduleName: string, cause: unknown): RecipleErrorOptions {
        return {
            message: `Failed to start module ${kleur.red("'" + moduleName + "'")}`,
            cause,
            name: `StartModuleError`
        };
    }

    public static createLoadModuleErrorOptions(moduleName: string, cause: unknown): RecipleErrorOptions {
        return {
            message: `Failed to load ${kleur.red("'" + moduleName + "'")}`,
            cause,
            name: 'LoadModuleError'
        };
    }

    public static createUnloadModuleErrorOptions(moduleName: string, cause: unknown): RecipleErrorOptions {
        return {
            message: `Failed to unload ${kleur.red("'" + moduleName + "'")}`,
            cause,
            name: 'UnloadModuleError'
        };
    }

    public static createUnsupportedModuleErrorOptions(moduleDisplayName: string): RecipleErrorOptions {
        return {
            message: `The module ${kleur.red("'" + moduleDisplayName + "'")} does not support reciple client ${kleur.blue().bold(buildVersion)}`,
            name: 'UnsupportedModule'
        };
    }

    public static createResolveModuleFilesErrorOptions(file: string, cause: unknown): RecipleErrorOptions {
        return {
            message: `An error occured while resolving module file ${kleur.green("'" + file + "'")}`,
            cause,
            name: 'ResolveModuleFilesError'
        };
    }
}
