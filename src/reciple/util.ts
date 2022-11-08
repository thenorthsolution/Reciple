import { getOperatingSystem, Logger, LogLevels, OS } from 'fallout-utility';
import { AnyCommandBuilder, CommandType } from './types/builders';
import { flags } from './flags';
import chalk from 'chalk';
import _path from 'path';

/**
 * Check if an object is a class
 * @param object Object to identify
 */
export function isClass<T>(object: any): object is T {
    const isClassConstructor = object.constructor && object.constructor.toString().substring(0, 5) === 'class';
    if (object.prototype === undefined) return isClassConstructor;

    const isPrototypeClassConstructor = object.prototype.constructor && object.prototype.constructor.toString && object.prototype.constructor.toString().substring(0, 5) === 'class';
    return isClassConstructor || isPrototypeClassConstructor;
}

/**
 * Emit process warning about deprecated method/function
 * @param content Warning content
 */
export function deprecationWarning(content: string | Error): void {
    process.emitWarning(content, 'DeprecationWarning');
}

export function validateCommandBuilder(command: AnyCommandBuilder): command is AnyCommandBuilder {
    if (!command.name) return false;
    if (command.type === CommandType.MessageCommand && command.options.length && command.options.some(o => !o.name)) return false;

    return true;
}

/**
 * Create new logger
 * @param stringifyJSON stringify json objects in console
 * @param debugmode display debug messages
 * @param colorizeMessage add logger colours to messages
 */
export function createLogger(stringifyJSON: boolean, debugmode: boolean = false, colorizeMessage: boolean = true): Logger {
    return new Logger({
        stringifyJSON: stringifyJSON,
        enableDebugMode: (flags.debugmode as boolean | undefined) ?? debugmode,
        loggerName: 'Main',
        prefixes: {
            [LogLevels.INFO]: (name?: string) => `[${new Date().toLocaleTimeString(undefined, { hour12: false })}][${(name ? name + '/' : '') + 'INFO'}]`,
            [LogLevels.WARN]: (name?: string) => `[${chalk.yellow(new Date().toLocaleTimeString(undefined, { hour12: false }))}][${chalk.yellow((name ? name + '/' : '') + 'WARN')}]`,
            [LogLevels.ERROR]: (name?: string) => `[${chalk.red(new Date().toLocaleTimeString(undefined, { hour12: false }))}][${chalk.red((name ? name + '/' : '') + 'ERROR')}]`,
            [LogLevels.DEBUG]: (name?: string) => `[${chalk.blue(new Date().toLocaleTimeString(undefined, { hour12: false }))}][${chalk.blue((name ? name + '/' : '') + 'DEBUG')}]`,
        },
        colorMessages: {
            [LogLevels.INFO]: (message: string) => message,
            [LogLevels.WARN]: (message: string) => (!colorizeMessage ? message : chalk.yellow(message)),
            [LogLevels.ERROR]: (message: string) => (!colorizeMessage ? message : chalk.red(message)),
            [LogLevels.DEBUG]: (message: string) => (!colorizeMessage ? message : chalk.blue(message)),
        },
        ObjectInspectDepth: 3,
        ObjectInspectColorized: colorizeMessage
    });
}

/**
 * Path module that depending on os
 */
export const path: _path.PlatformPath = getOperatingSystem() === OS.WINDOWS ? _path.win32 : _path.posix;
