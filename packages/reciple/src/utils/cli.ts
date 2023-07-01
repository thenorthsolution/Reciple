import { realVersion } from '@reciple/client';
import { readFileSync } from 'node:fs';
import { deprecate } from 'node:util';
import { Command } from 'commander';
import { coerce } from 'semver';
import path from 'node:path';

const { version, description } = JSON.parse(readFileSync(path.join(__dirname, '../../package.json'), 'utf-8'));

export let command = new Command()
    .name('reciple')
    .description(description)
    .version(`Reciple CLI: ${version}\nReciple Client: ${realVersion}`, '-v, --version')
    .argument('[cwd]', 'Change the current working directory')
    .option('-t, --token <token>', 'Replace used bot token')
    .option('-c, --config <dir>', 'Set path to a config file', (v, p: string[]) => p.concat([v]), [])
    .option('-D, --debugmode', 'Enable debug mode')
    .option('-y, --yes', 'Agree to all Reciple confirmation prompts')
    .option('--env <file>', '.env file location')
    .option('--shardmode', 'Modifies some functionalities to support sharding')
    .option('--setup', 'Create required config without starting the bot')
    .option('--cache-config <file>', 'Add custom caching config')
    .option('--sweeper-config <file>', 'Add custom sweeper config')
    .allowUnknownOption(true);

export interface CLIOptions {
    version?: string;
    token?: string;
    config?: string[];
    debugmode?: boolean;
    yes?: boolean;
    env?: string;
    shardmode?: boolean;
    setup?: boolean;
    cacheConfig?: string;
    sweeperConfig?: string;
    [k: string]: any;
}

export const cli = {
    get args() { return command.args; },
    get options() { return command.opts<CLIOptions>(); },
    get cwd() { return this.args[0] ? path.resolve(this.args[0]) : process.cwd(); },
    binPath: path.join(__dirname, '../bin.mjs')
};

export const cliVersion = `${coerce(version)}`;

// TODO: Remove deprecated

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
