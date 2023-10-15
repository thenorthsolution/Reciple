// @ts-check
import { ConfigReader, cli, command, createLogger } from 'reciple';
import { ShardingManager } from 'discord.js';
import { config as loadEnv } from 'dotenv';
import path from 'node:path';

Reflect.set(command, 'options', command.options.filter(o => !['shardmode', 'version', 'yes'].includes(o.name())));
command.name('').description('The options below are passed to reciple cli shards').parse();

process.chdir(cli.cwd);

const console = await (await createLogger({
    enabled: true,
    debugmode: true,
    coloredMessages: true,
}))
.setDebugMode(true)
.setName('ShardManager')
.createFileWriteStream({
    file: path.join(process.cwd(), 'logs/sharder/latest.log'),
    renameOldFile: true
});

loadEnv({ path: cli.options.env });

const config = (await ConfigReader.readConfigJS(cli.options.config)).config;
const shards = new ShardingManager(cli.binPath, {
    shardArgs: ['--shardmode', ...process.argv.slice(2)],
    token: config.token,
    mode: 'process',
    respawn: true,
});

shards.on('shardCreate', shard => {
    console.log(`Creating shard ${shard.id}...`);

    shard.on('ready', () => console.log(`Shard ${shard.id} is ready!`));
    shard.on('reconnecting', () => console.log(`Shard ${shard.id} is reconnecting!`));
    shard.on('disconnect', () => console.log(`Shard ${shard.id} disconnected!`));
    shard.on('death', () => console.log(`Shard ${shard.id} died!`));
    shard.on('error', err => console.log(`Shard ${shard.id} encountered an error!\n`, err));

    if (shard.worker) {
        shard.worker.stdout.on('data', chunk => console.writeStream?.write(chunk.toString('utf-8').trim()));
        shard.worker.stderr.on('data', chunk => console.writeStream?.write(chunk.toString('utf-8').trim()));
    }

    if (shard.process) {
        shard.process.stdout?.on('data', chunk => console.writeStream?.write(chunk.toString('utf-8').trim()));
        shard.process.stderr?.on('data', chunk => console.writeStream?.write(chunk.toString('utf-8').trim()));
    }

    shard.on('message', data => console.log(data));
});

shards.spawn();
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
