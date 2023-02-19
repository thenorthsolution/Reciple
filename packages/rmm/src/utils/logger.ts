import { Logger, LoggerLevel } from 'fallout-utility';
import { debug } from './cli.js';
import chalk from 'chalk';

export const logger = new Logger({
    enableDebugmode: debug,
    forceEmitLogEvents: true,
    formatMessageLines: {
        [LoggerLevel.INFO]: (msg) => `${chalk.green('INFO:')} ${msg}`,
        [LoggerLevel.WARN]: (msg) => `${chalk.yellow('WARN:')} ${msg}`,
        [LoggerLevel.ERROR]: (msg) => `${chalk.red('ERROR:')} ${msg}`,
        [LoggerLevel.DEBUG]: (msg) => `${chalk.cyan('DEBUG:')} ${msg}`
    }
});
