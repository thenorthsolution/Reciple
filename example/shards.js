// @ts-check
import { ShardingManager } from 'discord.js';
import { Config, argvOptions, command, cwd, createLogger } from 'reciple';
import { fileURLToPath } from 'url';
import path from 'path';

const console = createLogger({
        enabled: true,
        debugmode: true,
        coloredMessages: true,
    })
    .setName('ShardManager')
    .logToFile(path.join(cwd, 'logs/shards.log'), false, 'old.shards.log');

console.log(console.writeStream);

if (!import.meta.resolve) throw new Error(`Missing node option "--experimental-import-meta-resolve"`);

// @ts-expect-error We need to modify readonly command options
command.options = command.options.filter(o => !['shardmode', 'version', 'yes'].includes(o.name()));

command.name('').description('The options below are passed to reciple cli shards').parse();

const configPath = argvOptions().config
    ? path.isAbsolute(argvOptions().config)
        ? path.resolve(argvOptions().config)
        : path.join(cwd, argvOptions().config)
    : path.join(cwd, 'reciple.yml');

const config = (await new Config(configPath).parseConfig()).getConfig();

const recipleBin = path.join(path.dirname(fileURLToPath(await import.meta.resolve('reciple'))), 'bin.mjs');
const shards = new ShardingManager(recipleBin, {
    shardArgs: ['--shardmode', ...process.argv.slice(2)],
    token: config.token,
    totalShards: 2
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
});

shards.spawn();
