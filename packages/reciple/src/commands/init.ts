import type { Command } from 'commander';
import type { CLI } from '../classes/CLI.js';
import { Config } from '../classes/Config.js';

export interface CLIInitFlags {
    config: string;
}

export default (command: Command, cli: CLI) => command
    .command('init')
    .option('-c, --config <file>', 'Set the config file path', 'reciple.mjs')
    .description('Initializes the config file')
    .action(async () => {
        const flags = cli.getFlags<CLIInitFlags>('init')!;

        await Config.readConfigFile({ path: flags.config, createIfNotExists: true });
    });
