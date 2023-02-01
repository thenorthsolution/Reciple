import { IConfig } from '../classes/Config';
import { Logger, LoggerLevel } from 'fallout-utility';
import chalk from 'chalk';
import { RecipleClient } from '..';

export function formatLogMessage(message: string, logger: Logger, config: IConfig['logger'], level: LoggerLevel): string {
    const color = (msg: string) => {
        if (!config.coloredMessages || level === LoggerLevel.INFO) return msg;

        switch (level) {
            case LoggerLevel.WARN:
                return chalk.yellow(msg);
            case LoggerLevel.ERROR:
                return chalk.red(msg);
            case LoggerLevel.DEBUG:
                return chalk.cyan(msg);
            default:
                return msg;
        }
    };

    return `[${color(new Date().toLocaleTimeString(undefined, { hour12: false }))}][${color((logger.name ? logger.name + '/' : '') + LoggerLevel[level])}] ${message}`;
}

export function createLogger(config: IConfig['logger']): Logger {
    return new Logger({
        enableDebugmode: config.debugmode === true,
        forceEmitLogEvents: true,
        name: 'Client',
        formatMessageLines: {
            [LoggerLevel.INFO]: (message, logger) => formatLogMessage(message, logger, config, LoggerLevel.INFO),
            [LoggerLevel.WARN]: (message, logger) => formatLogMessage(message, logger, config, LoggerLevel.WARN),
            [LoggerLevel.ERROR]: (message, logger) => formatLogMessage(message, logger, config, LoggerLevel.ERROR),
            [LoggerLevel.DEBUG]: (message, logger) => formatLogMessage(message, logger, config, LoggerLevel.DEBUG),
        }
    });
}

export function eventLogger(client: RecipleClient): void {
    client.modules.on('resolveModuleFileError', (file, error) => client.logger?.err(`Failed to resolve module '${file}': `, error));

    client.modules.on('preLoadModule', (module_) => client.logger?.debug(`Loading module '${module_.displayName}'`));
    client.modules.on('postLoadModule', (module_) => client.logger?.log(`Loaded module '${module_.displayName}'`));
    client.modules.on('loadModuleFailed', (module_) => client.logger?.error(`Failed to load module '${module_.displayName}': Returned false`));
    client.modules.on('loadModuleError', (module_, err) => client.logger?.error(`An error occured while loading module: '${module_.displayName}': `, err));

    client.modules.on('preStartModule', (module_) => client.logger?.debug(`Starting module '${module_.displayName}'`));
    client.modules.on('postStartModule', (module_) => client.logger?.log(`Started module '${module_.displayName}'`));
    client.modules.on('startModuleError', (module_, err) => client.logger?.error(`An error occured while starting module '${module_.displayName}': `, err));

    client.modules.on('preUnloadModule', (module_) => client.logger?.debug(`Unloading module '${module_.displayName}'`));
    client.modules.on('postUnloadModule', (module_) => client.logger?.log(`Unloaded module '${module_.displayName}'`));
    client.modules.on('unloadModuleError', (module_, err) => client.logger?.error(`An error occured while unloading module '${module_.displayName}'`, err));

    client.on('recipleRegisterApplicationCommands', (commands, guild) => client.logger?.log(`Register ${commands.size} application commands ${guild ? ' to ' + guild : 'globally'}`));
}
