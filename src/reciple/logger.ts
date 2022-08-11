import { Logger, LogLevels } from 'fallout-utility';
import { flags } from './flags'
import chalk from 'chalk';

/**
 * Create new logger
 * @param stringifyJSON stringify json objects in console
 * @param debugmode display debug messages
 * @param colorizeMessage add logger colours to messages
 */
export function createLogger (stringifyJSON: boolean, debugmode: boolean = false, colorizeMessage: boolean = true) {
    return new Logger({
        stringifyJSON: stringifyJSON,
        enableDebugMode: flags.debugmode as boolean|undefined ?? debugmode,
        loggerName: 'Main',
        prefixes: {
            [LogLevels.INFO]: (name?: string) => `[${new Date().toLocaleTimeString()}][${(name ? name + "/" : '') + "INFO"}]`,
            [LogLevels.WARN]: (name?: string) => `[${chalk.yellow(new Date().toLocaleTimeString())}][${chalk.yellow((name ? name + "/" : '') + "WARN")}]`,
            [LogLevels.ERROR]: (name?: string) => `[${chalk.red(new Date().toLocaleTimeString())}][${chalk.red((name ? name + "/" : '') + "ERROR")}]`,
            [LogLevels.DEBUG]: (name?: string) => `[${chalk.blue(new Date().toLocaleTimeString())}][${chalk.blue((name ? name + "/" : '') + "DEBUG")}]`
        },
        colorMessages: {
            [LogLevels.INFO]: (message: string) => message,
            [LogLevels.WARN]: (message: string) => !colorizeMessage ? message : chalk.yellow(message),
            [LogLevels.ERROR]: (message: string) => !colorizeMessage ? message : chalk.red(message),
            [LogLevels.DEBUG]: (message: string) => !colorizeMessage ? message : chalk.blue(message)
        }
    });
}
