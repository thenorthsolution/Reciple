// @ts-check
import { ConfigReader, cli, command, createLogger } from 'reciple';
import { ShardingManager } from 'discord.js';
import { config as loadEnv } from 'dotenv';
import { createReadStream } from 'node:fs';
import path from 'node:path';

Reflect.set(command, 'options', command.options.filter(o => !['shardmode', 'version', 'yes'].includes(o.name())));
command.name('').description('The options below are passed to reciple cli shards').parse();

process.chdir(cli.cwd);

loadEnv({ path: cli.flags.env });

const config = (await ConfigReader.readConfigJS(cli.flags.config ?? 'reciple.mjs')).config;
const logsFolder = process.env.LOGS_FOLDER ?? path.join(process.cwd(), ((typeof config.logger?.logToFile !== 'function' ? config.logger?.logToFile.logsFolder : null) ?? 'logs'));

const logger = await (await createLogger({
    debugmode: true,
    coloredMessages: true,
    shards: false
}))
.setDebugMode(true)
.setName('ShardManager')
.createFileWriteStream({
    file: path.join(logsFolder, `/sharder/${process.pid}/main.log`),
    renameOldFile: true
});

Reflect.set(process.env, 'SHARDMODE', true);
Reflect.set(process.env, 'SHARDS_LOGS_FOLDER', path.join(logsFolder, `/sharder/${process.pid}`));

const shards = new ShardingManager(cli.binPath, {
    shardArgs: ['--shardmode', ...process.argv.slice(2)],
    token: config.token,
    totalShards: 5,
    mode: 'worker',
    respawn: true,
});

shards.on('shardCreate', shard => {
    /**
     * @type {string}
     */
    let logs;

    logger.log(`Creating shard ${shard.id}...`);

    shard.on('ready', () => {
        logger.log(`Shard ${shard.id} is ready!`);
        if (!logs) return;

        logger.log(`Logs for shard ${shard.id} is located at '${logs}'`);

        const readStream = createReadStream(logs, 'utf-8');

        readStream.on('data', data => logger.writeStream?.write(data.toString('utf-8')));
    });

    shard.on('reconnecting', () => logger.log(`Shard ${shard.id} is reconnecting!`));
    shard.on('disconnect', () => logger.log(`Shard ${shard.id} disconnected!`));
    shard.on('death', () => logger.log(`Shard ${shard.id} died!`));
    shard.on('error', err => logger.log(`Shard ${shard.id} encountered an error!\n`, err));

    shard.on('message', data => {
        if (!('type' in data) || data.type !== 'ProcessInfo') return;

        logs = data.log;
    });
});

process.stdin.resume();

process.once('SIGHUP', stopProcess);
process.once('SIGINT', stopProcess);
process.once('SIGQUIT', stopProcess);
process.once('SIGABRT', stopProcess);
process.once('SIGALRM', stopProcess);
process.once('SIGTERM', stopProcess);
process.once('SIGBREAK', stopProcess);
process.once('SIGUSR2', stopProcess);

function stopProcess() {
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

await shards.spawn();
