import { ShardingManager } from 'discord.js';
import 'dotenv/config';

const shards = new ShardingManager('../node_modules/reciple/bin/bin.mjs', {
    token: process.env['TOKEN'],
    shardArgs: ['--shardmode'],
    mode: 'process',
    respawn: true
});

shards.on('shardCreate', shard => console.log(`Created shard ${shard.id}`));

await shards.spawn({
    amount: 2
});
