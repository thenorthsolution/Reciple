import type { Command } from 'commander';
import { CLI } from '../classes/CLI.js';
import { Config } from '../classes/Config.js';
import { FileWriteStreamMode, Logger } from 'prtyprnt';
import type { CLIStartFlags } from './start.js';
import path from 'path';
import { ShardingManager } from 'discord.js';
import { resolveEnvProtocol } from '@reciple/utils';
import { EventHandlers } from '../index.js';
import { createReadStream } from 'fs';
import { kleur } from 'fallout-utility';

export interface CLIShardFlags extends CLIStartFlags {}

export default (command: Command, cli: CLI) => command
    .command('shard')
    .description('Starts in sharding mode')
    .option('-t, --token <DiscordToken>', 'Set your Discord Bot token')
    .option('-c, --config <file>', 'Set the config file path', 'reciple.mjs')
    .action(async () => {
        let logger: Logger|null = cli.logger ?? null;

        const startFlags = CLI.stringifyFlags(cli.getFlags<CLIStartFlags>('shard')!, cli.getCommand('shard')!);
        const recipleFlags = CLI.stringifyFlags(cli.getFlags(), cli.getCommand());
        const processFlags = [...startFlags, ...recipleFlags];

        const processErrorLogger = (err: any) => {
            logger?.error(err);
            process.exit(1);
        };

        process.once('uncaughtException', processErrorLogger);
        process.once('unhandledRejection', processErrorLogger);

        const flags = cli.getFlags<CLIStartFlags>('start', true)!;
        const { config, sharding: shardingConfig } = await Config.readConfigFile({ path: flags.config, createIfNotExists: false }).then(data => data ?? ({ config: null, sharding: null }));

        if (!config && !shardingConfig) {
            logger?.error('No config file found');
            process.exit(1);
        }

        let logFile: string|null = null;
        let logsFolder: string|null = null;

        process.env.SHARDS_DEPLOY_COMMANDS = '1';

        if (!(config.logger instanceof Logger) && config.logger?.logToFile.enabled) {
            logsFolder = path.resolve(path.join(config.logger?.logToFile?.logsFolder, 'sharder', process.pid.toString()));

            logFile = path.join(logsFolder, config.logger?.logToFile?.file);
            process.env.SHARDS_LOGS_FOLDER = logsFolder;

            logger?.log(`Logs folder is at '${kleur.cyan(logsFolder)}'`);
        }

        logger = config.logger instanceof Logger
            ? config.logger
            : config.logger?.enabled
                ? cli.logger?.clone({
                    label: 'Main',
                    writeStream: logFile ? await Logger.createFileWriteStream({
                        mode: FileWriteStreamMode.Rename,
                        path: logFile
                    }) : undefined
                }) || null
                : null;

        config.token = flags.token ? resolveEnvProtocol(flags.token) ?? '' : config.token;

        const manager = new ShardingManager(cli.binPath, {
            ...shardingConfig,
            token: config.token,
            shardArgs: processFlags,
        });

        EventHandlers.addExitListener(() => stopShardsProcess(manager));

        manager.on('shardCreate', shard => {
            let logs: string;
            let readStream: NodeJS.ReadableStream;

            logger?.log(`Creating shard ${shard.id}...`);

            shard.on('ready', () => {
                logger?.log(`Shard ${shard.id} is ready!`);
                if (!logs) return;

                logger?.log(`Logs for shards ${shard.id} is located at '${kleur.yellow(logs)}'`);

                readStream = createReadStream(logs, 'utf-8');

                if (logger?.writeStream) readStream.pipe(logger.writeStream);
            });

            shard.on('reconnecting', () => logger?.log(`Shard ${shard.id} is reconnecting!`));
            shard.on('disconnect', () => logger?.log(`Shard ${shard.id} disconnected!`));
            shard.on('death', () => logger?.log(`Shard ${shard.id} died!`));
            shard.on('error', err => logger?.log(`Shard ${shard.id} encountered an error!\n`, err));

            shard.on('message', data => {
                if (!('type' in data) || data.type !== 'ProcessInfo') return;

                logs = data.log;

                if (process.env.SHARDS_DEPLOY_COMMANDS) {
                    delete process.env.SHARDS_DEPLOY_COMMANDS;
                }
            });
        });

        logger?.log(`Starting ${manager.totalShards} shards...`);
        await manager.spawn();
    });

export function stopShardsProcess(shards: ShardingManager) {
    shards.shards.map(c => {
        logger.log(`Killed ${c.id}`);

        if (c.process) {
            c.process?.kill('SIGINT');
        } else {
            c.kill();
        }
    });

    logger.log(`Exitting process!`);
    setTimeout(() => process.exit(0), 500);
}
