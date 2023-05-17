import { IConfig } from '../classes/Config';
import { Logger, LoggerLevel, PartialDeep } from 'fallout-utility';
import { ApplicationCommand, Collection } from 'discord.js';
import { RecipleClient } from '../';
import { cli } from './cli';
import path from 'path';
import kleur from 'kleur';

export function formatLogMessage(message: string, logger: Logger, config: PartialDeep<IConfig['logger']>, level: LoggerLevel): string {
    const color = (msg: string) => {
        if (!config.coloredMessages || level === LoggerLevel.INFO) return msg;

        switch (level) {
            case LoggerLevel.WARN:
                return kleur.yellow(msg);
            case LoggerLevel.ERROR:
                return kleur.red(msg);
            case LoggerLevel.DEBUG:
                return kleur.cyan(msg);
            default:
                return msg;
        }
    };

    return (config.disableLogPrefix !== false
                ? color(
                        `[${new Date().toLocaleTimeString(undefined, { hour12: false })} ${LoggerLevel[level]}]` +
                        (cli.options.shardmode && process.pid ? `[${process.pid}]` : '') +
                        (logger.name ? `[${logger.name}]` : '')
                    )
                : ''
            ) + ` ${message}`;
}

export async function createLogger(config: PartialDeep<IConfig['logger']>): Promise<Logger> {
    const logger = new Logger({
        enableDebugmode: cli.options.debugmode || config.debugmode === true,
        forceEmitLogEvents: true,
        formatMessage: (message, level, logger) => formatLogMessage(message, logger, config, level)
    });

    if (config.logToFile?.enabled) {
        await logger.createFileWriteStream({
            file: path.join(cli.cwd, config.logToFile?.logsFolder ?? path.join(cli.cwd, 'logs'), !cli.options.shardmode ? (config.logToFile?.file ?? 'latest.log') : `${process.pid}.log`)
        });
    }

    return logger;
}

export function quoteString(string: string, quote: string = "'"): string {
    return `${quote}${string}${quote}`;
}

export function eventLogger(client: RecipleClient): void {
    client.on('recipleDebug', debug => client.logger?.debug(debug));

    client.modules.on('resolveModuleFileError', (file, error) => client.logger?.err(`Failed to resolve module ${kleur.yellow(quoteString(file))}:`, error));

    client.modules.on('preStartModule', (module_) => client.logger?.debug(`Starting module ${kleur.cyan(quoteString(module_.displayName))}`));
    client.modules.on('postStartModule', (module_) => client.logger?.log(`Started module ${kleur.cyan(quoteString(module_.displayName))}`));
    client.modules.on('startModuleFailed', (module_) => client.logger?.error(`Failed to start module ${kleur.yellow(quoteString(module_.displayName))}: ${kleur.red('Module returned false')}`));
    client.modules.on('startModuleError', (module_, err) => client.logger?.error(`An error occured while starting module ${kleur.yellow(quoteString(module_.displayName))}:`, err));

    client.modules.on('preLoadModule', (module_) => client.logger?.debug(`Loading module ${kleur.cyan(quoteString(module_.displayName))}`));
    client.modules.on('postLoadModule', (module_) => client.logger?.log(`Loaded module ${kleur.cyan(quoteString(module_.displayName))}`));
    client.modules.on('loadModuleError', (module_, err) => client.logger?.error(`An error occured while loading module ${kleur.yellow(quoteString(module_.displayName))}:`, err));

    client.modules.on('preUnloadModule', (module_) => client.logger?.debug(`Unloading module ${kleur.cyan(quoteString(module_.displayName))}`));
    client.modules.on('postUnloadModule', (module_) => client.logger?.log(`Unloaded module ${kleur.cyan(quoteString(module_.displayName))}`));
    client.modules.on('unloadModuleError', (module_, err) => client.logger?.error(`An error occured while unloading module ${kleur.yellow(quoteString(module_.displayName))}:`, err));

    client.on('recipleRegisterApplicationCommands', (commands: Collection<string, ApplicationCommand>, guild) => client.logger?.log(`Registered (${commands?.size || 0}) application commands ${guild ? 'to ' + guild : 'globally'}`));
}
