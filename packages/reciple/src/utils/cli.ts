import { isMainThread, parentPort, threadId } from 'node:worker_threads';
import { PackageUpdateChecker } from '@reciple/utils';
import { buildVersion } from '@reciple/core';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { Command } from 'commander';
import { coerce } from 'semver';
import path from 'node:path';

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
    /**
     * This property returns the command-line arguments passed to the CLI. It is an array of strings, where each string represents an argument.
     */
    get args() { return command.args; },
    /**
     * This property returns the command-line options passed to the CLI. It is an object with keys and values depending on the options specified in the command-line arguments.
     */
    get options() { return command.opts<CLIOptions>(); },
    /**
     * This property returns the current working directory (CWD) of the CLI. It takes into account the command-line arguments passed to the CLI.
     */
    get cwd() {
        return this.args[0]
            ? path.isAbsolute(this.args[0]) ? this.args[0] : path.join(originalCwd, this.args[0])
            : process.cwd();
    },
    /**
     * This property returns a boolean value indicating whether shard mode is enabled or not.
     * It is enabled if the shardmode option is specified in the command-line arguments, or if the `SHARDMODE` environment variable is set to `1`. Otherwise, it is disabled.
     */
    get shardmode() { return !!(this.options.shardmode ?? process.env.SHARDMODE) },
    /**
     * This property returns the thread ID of the current thread, if it is not the main thread.
     */
    threadId: !isMainThread && parentPort !== undefined ? threadId : undefined,
    /**
     * This property is used to store a boolean value indicating whether the CWD has been updated or not.
     */
    isCwdUpdated: false,
    /**
     * This property returns the current working directory of the Node.js process.
     */
    nodeCwd: process.cwd(),
    /**
     *  This property returns the path of the bin.mjs file, which is the main entry point of the CLI.
     */
    binPath: path.join(path.dirname(fileURLToPath(import.meta.url)), '../bin.mjs'),
    /**
     * Reciple package root directory
     */
    reciplePackagePath: path.join(path.dirname(fileURLToPath(import.meta.url)), '../../'),
    /**
     * This property is used to store the path of the log file.
     */
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
