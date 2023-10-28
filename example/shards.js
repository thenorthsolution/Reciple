// @ts-check
import { ConfigReader, cli, command, createLogger } from 'reciple';
import { ShardingManager } from 'discord.js';
import { config as loadEnv } from 'dotenv';
import { createReadStream } from 'node:fs';
import path from 'node:path';

Reflect.set(command, 'options', command.options.filter(o => !['shardmode', 'version', 'yes'].includes(o.name())));
command.name('').description('The options below are passed to reciple cli shards').parse();

process.chdir(cli.cwd);

loadEnv({ path: cli.options.env });

const config = (await ConfigReader.readConfigJS(cli.options.config)).config;
const logsFolder = path.join(process.cwd(), (config.logger.logToFile.logsFolder || 'logs'));

const console = await (await createLogger({
    enabled: true,
    debugmode: true,
    coloredMessages: true,
}))
.setDebugMode(true)
.setName('ShardManager')
.createFileWriteStream({
    file: path.join(logsFolder, '/sharder/latest.log'),
    renameOldFile: true
});

Object.defineProperty(process.env, 'SHARDMODE', true);

const shards = new ShardingManager(cli.binPath, {
    shardArgs: ['--shardmode', ...process.argv.slice(2)],
    token: config.token,
    mode: 'worker',
    respawn: true,
});

shards.on('shardCreate', shard => {
    /**
     * @type {number}
     */
    let pid;
    /**
     * @type {string}
     */
    let logs;

    console.log(`Creating shard ${shard.id}...`);

    shard.on('ready', () => {
        console.log(`Shard ${shard.id} is ready!`);
        if (!pid) return;

        console.log(`PID: ${pid}; Logs for shard ${shard.id} is located at '${logs}'`);

        const readStream = createReadStream(logs, 'utf-8');
        if (console.writeStream) readStream.pipe(console.writeStream);
    });

    shard.on('reconnecting', () => console.log(`Shard ${shard.id} is reconnecting!`));
    shard.on('disconnect', () => console.log(`Shard ${shard.id} disconnected!`));
    shard.on('death', () => console.log(`Shard ${shard.id} died!`));
    shard.on('error', err => console.log(`Shard ${shard.id} encountered an error!\n`, err));

    shard.on('message', data => {
        if (!('type' in data) || data.type !== 'ProcessInfo') return;

        pid = data.pid;
        logs = path.join(logsFolder, `${pid}.log`);
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
        console.log(`Killed ${c.id}`);

        if (c.process) {
            c.process?.kill('SIGINT');
        } else {
            c.kill();
        }
    });

    console.log(`Exitting process!`);
    setTimeout(() => process.exit(0), 500);
}

await shards.spawn();
