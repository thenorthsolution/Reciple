import { Logger, LoggerLevel, PartialDeep, kleur } from 'fallout-utility';
import { RecipleConfig } from '../classes/Config';
import { RecipleClient } from '../';
import path from 'node:path';
import { cli } from './cli';

export function formatLogMessage(message: string, logger: Logger, config: PartialDeep<Exclude<RecipleConfig['logger'], Logger|undefined>>, level: LoggerLevel): string {
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

    return (!config.disableLogPrefix
                ? color(
                        `[${new Date().toLocaleTimeString(undefined, { hour12: false })} ${LoggerLevel[level]}]` +
                        (cli.shardmode && process.pid ? `[${process.pid}]` : '') +
                        (logger.name ? `[${logger.name}]` : '')
                    )
                : ''
            ) + ` ${message}`;
}

export async function createLogger(config: PartialDeep<Exclude<RecipleConfig['logger'], Logger|undefined>>): Promise<Logger> {
    const logger = new Logger({
        enableDebugmode: (cli.options.debugmode || config.debugmode) ?? null,
        forceEmitLogEvents: true,
        formatMessage: (message, level, logger) => formatLogMessage(message, logger, config, level)
    });

    if (config.logToFile?.enabled) {
        await logger.createFileWriteStream({
            file: path.join(process.cwd(), config.logToFile?.logsFolder ?? path.join(process.cwd(), 'logs'), !cli.shardmode ? (config.logToFile?.file ?? 'latest.log') : `${process.pid}.log`)
        });
    }

    return logger;
}

export function addEventListenersToClient(client: RecipleClient<true>): void {
    client.on('recipleDebug', debug => client.logger?.debug(debug));

    client.modules.on('resolveModuleFileError', (file, error) => client.logger?.err(`Failed to resolve module ${kleur.yellow(quoteString(file))}:`, error));

    client.modules.on('preStartModule', (m) => client.logger?.debug(`Starting module ${kleur.cyan(quoteString(m.displayName))}`));
    client.modules.on('postStartModule', (m) => client.logger?.log(`Started module ${kleur.cyan(quoteString(m.displayName))}`));
    client.modules.on('startModuleError', (m, err) => client.logger?.error(`Failed to start module ${kleur.yellow(quoteString(m.displayName))}:`, err));

    client.modules.on('preLoadModule', (m) => client.logger?.debug(`Loading module ${kleur.cyan(quoteString(m.displayName))}`));
    client.modules.on('postLoadModule', (m) => client.logger?.log(`Loaded module ${kleur.cyan(quoteString(m.displayName))}`));
    client.modules.on('loadModuleError', (m, err) => client.logger?.error(`Failed to load module ${kleur.yellow(quoteString(m.displayName))}:`, err));

    client.modules.on('preUnloadModule', (m) => client.logger?.debug(`Unloading module ${kleur.cyan(quoteString(m.displayName))}`));
    client.modules.on('postUnloadModule', (m) => client.logger?.log(`Unloaded module ${kleur.cyan(quoteString(m.displayName))}`));
    client.modules.on('unloadModuleError', (m, err) => client.logger?.error(`Failed to unload module ${kleur.yellow(quoteString(m.displayName))}:`, err));

    client.on('recipleRegisterApplicationCommands', (commands, guild) => client.logger?.log(`Registered (${commands?.size || 0}) application commands ${guild ? 'to ' + guild : 'globally'}`));
}

function quoteString(string: string, quote: string = "'"): string {
    return `${quote}${string}${quote}`;
}
