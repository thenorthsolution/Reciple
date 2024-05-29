import { isMainThread, parentPort, threadId } from 'node:worker_threads';
import { buildVersion } from '@reciple/core';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { Command } from 'commander';
import { coerce } from 'semver';
import path from 'node:path';
import { PackageUpdateChecker } from '@reciple/utils';

const { version, description } = JSON.parse(readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '../../package.json'), 'utf-8'));
const originalCwd = process.cwd();

export let command = new Command()
    .name('reciple')
    .description(description)
    .version(`Reciple CLI: ${version}\nReciple Client: ${buildVersion}`, '-v, --version')
    .argument('[cwd]', 'Change the current working directory')
    .option('-t, --token <token>', 'Replace used bot token')
    .option('-c, --config <dir>', 'Set path to a config file')
    .option('-D, --debugmode', 'Enable debug mode')
    .option('-y, --yes', 'Agree to all Reciple confirmation prompts')
    .option('--env <file>', '.env file location')
    .option('--shardmode', 'Modifies some functionalities to support sharding')
    .option('--setup', 'Create required config without starting the bot')
    .allowUnknownOption(true);

export interface CLIOptions {
    version?: string;
    token?: string;
    config?: string;
    debugmode?: boolean;
    yes?: boolean;
    env?: string;
    shardmode?: boolean;
    setup?: boolean;
    [k: string]: any;
}

export const cli = {
    get args() { return command.args; },
    get options() { return command.opts<CLIOptions>(); },
    get cwd() {
        return this.args[0]
            ? path.isAbsolute(this.args[0]) ? this.args[0] : path.join(originalCwd, this.args[0])
            : process.cwd();
    },
    get shardmode() { return !!(this.options.shardmode ?? process.env.SHARDMODE) },
    threadId: !isMainThread && parentPort !== undefined ? threadId : undefined,
    isCwdUpdated: false,
    nodeCwd: process.cwd(),
    binPath: path.join(path.dirname(fileURLToPath(import.meta.url)), '../bin.mjs'),
    logPath: undefined as string|undefined
};

export const cliVersion = `${coerce(version)}`;
export const cliBuildVersion = version;
export const updateChecker = new PackageUpdateChecker({
    packages: [
        { package: 'reciple', currentVersion: cliBuildVersion },
        { package: '@reciple/core', currentVersion: buildVersion }
    ]
});
