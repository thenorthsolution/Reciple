import { realVersion } from '@reciple/client';
import { Command } from 'commander';
import { readFileSync } from 'fs';
import path from 'path';
import { deprecate } from 'util';

const { version, description } = JSON.parse(readFileSync(path.join(__dirname, '../../package.json'), 'utf-8'));

export let command = new Command()
    .name('reciple')
    .description(description)
    .version(`Reciple CLI: ${version}\nReciple Client: ${realVersion}`, '-v, --version')
    .argument('[cwd]', 'Change the current working directory')
    .option('-t, --token <token>', 'Replace used bot token')
    .option('-c, --config <dir>', 'Change path to config file')
    .option('-D, --debugmode', 'Enable debug mode')
    .option('-y, --yes', 'Agree to all Reciple confirmation prompts')
    .option('--env <file>', '.env file location')
    .option('--shardmode', 'Modifies some functionalities to support sharding')
    .option('--setup', 'Create required config without starting the bot')
    .option('--cache-config <file>', 'Add custom caching config')
    .option('--sweeper-config <file>', 'Add custom sweeper config')
    .allowUnknownOption(true);

export const cli = {
    get args() { return command.args; },
    get options() { return command.opts(); },
    get cwd() { return this.args[0] ? path.resolve(this.args[0]) : process.cwd(); }
};

/**
 * @deprecated Use `cli` object instead
 */
export const flags = cli.options;

/**
 * @deprecated Use `cli` object instead
 */
export const argvOptions = deprecate(() => cli.options, 'argvOptions() is deprecated. Use the cli.args instead.');

/**
 * @deprecated Use `cli` object instead
 */
export const cwd = cli.args[0] ? path.resolve(cli.args[0]) : process.cwd();
