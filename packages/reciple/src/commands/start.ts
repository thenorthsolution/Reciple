import type { Command } from 'commander';
import type { CLI } from '../classes/CLI.js';
import path from 'node:path';

export default (command: Command, cli: CLI) => command
    .command('start', { isDefault: true })
    .description('Starts the bot')
    .option('-t, --token <DiscordToken>', 'Set your Discord Bot token')
    .option('-c, --config <file>', 'Set the config file path', path.join(cli.cwd, 'reciple.mjs'))
    .action(() => {});
