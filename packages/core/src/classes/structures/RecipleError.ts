import { kleur } from 'fallout-utility/strings';
import { stripVTControlCharacters } from 'util';
import { Utils } from './Utils';
import { AnyCommandBuilder, AnyCommandBuilderData } from '../../types/structures';
import { buildVersion } from '../../types/constants';

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

    public static createCommandExecuteErrorOptions(builder: AnyCommandBuilder|AnyCommandBuilderData, cause: unknown): RecipleErrorOptions {
        return {
            message: `An error occured while executing a ${kleur.cyan(Utils.getCommandTypeName(builder.command_type))} named ${kleur.red("'" + builder.name + "'")}`,
            cause,
            name: 'CommandExecuteError'
        };
    }

    public static createCommandHaltErrorOptions(builder: AnyCommandBuilder|AnyCommandBuilderData, cause: unknown): RecipleErrorOptions {
        return {
            message: `An error occured while executing the halt function of a ${kleur.cyan(Utils.getCommandTypeName(builder.command_type))} named ${kleur.red("'" + builder.name + "'")}`,
            cause,
            name: 'CommandHaltError'
        };
    }

    public static createCommandPreconditionErrorOptions(builder: AnyCommandBuilder|AnyCommandBuilderData, cause: unknown): RecipleErrorOptions {
        return {
            message: `An error occured while executing precondition for ${kleur.cyan(Utils.getCommandTypeName(builder.command_type))} named ${kleur.red("'" + builder.name + "'")}`,
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
            message: `The module ${kleur.red("'" + moduleDisplayName + "'")} does not support reciple client ${kleur.blue().bold(buildVersion)}`,
            name: 'UnsupportedModule'
        };
    }
}
