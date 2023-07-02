// @ts-check
import { Config, cli, command, createLogger } from 'reciple';
import path from 'path';
import { ShardingManager } from 'discord.js';

// @ts-expect-error We need to modify readonly command options
command.options = command.options.filter(o => !['shardmode', 'version', 'yes'].includes(o.name()));

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
    file: path.join(process.cwd(), 'sharder-logs/shards.log'),
    renameOldFile: true
});

let configPaths = cli.options?.config?.map(c => path.isAbsolute(c) ? path.resolve(c) : path.join(process.cwd(), c));
    configPaths = !configPaths?.length ? [path.join(process.cwd(), 'reciple.yml')] : configPaths;

/**
 * @type {string}
 */
// @ts-ignore
const mainConfigPath = configPaths.shift();

const configParser = await (new Config(mainConfigPath, configPaths)).parseConfig();
const config = configParser.getConfig();

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
});

shards.spawn();
