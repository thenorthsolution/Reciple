import { isMainThread, parentPort, threadId } from 'node:worker_threads';
import { UpdateData, checkLatestUpdate } from '@reciple/update-checker';
import { Logger, buildVersion } from '@reciple/core';
import { kleur } from 'fallout-utility';
import { readFileSync } from 'node:fs';
import { Command } from 'commander';
import { coerce } from 'semver';
import path from 'node:path';

const { version, description } = JSON.parse(readFileSync(path.join(__dirname, '../../package.json'), 'utf-8'));
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
    binPath: path.join(__dirname, '../bin.mjs'),
    logPath: undefined as string|undefined
};

export const cliVersion = `${coerce(version)}`;
export const cliBuildVersion = version;

export async function checkForUpdates(logger?: Logger): Promise<Record<'reciple'|'@reciple/core', UpdateData|null>> {
    const updates = await Promise.all([
        checkLatestUpdate('reciple', cliBuildVersion).catch(() => null),
        checkLatestUpdate('@reciple/core', buildVersion).catch(() => null),
    ]);

    if (logger) for (const update of updates) {
        logger.debug(`Update checked for ${update?.package}`, update);
        if (!update?.updateType) continue;

        logger.warn(`An update is available for ${kleur.cyan(update.package)}: ${kleur.red(update.currentVersion)} ${kleur.gray('->')} ${kleur.green().bold(update.updatedVersion)}`);
    }

    return {
        'reciple': updates.find(u => u?.package === 'reciple') ?? null,
        '@reciple/core': updates.find(u => u?.package === '@reciple/core') ?? null,
    };
}
