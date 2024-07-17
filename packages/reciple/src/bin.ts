#!/usr/bin/env node

import { ContextMenuCommandBuilder, Logger, MessageCommandBuilder, SlashCommandBuilder, buildVersion } from '@reciple/core';
import { createLogger, addEventListenersToClient } from './utils/logger.js';
import { RecipleClient, findModules, moduleFilesFilter } from './index.js';
import { cli, cliVersion, updateChecker } from './utils/cli.js';
import { setTimeout as setTimeoutAsync } from 'node:timers/promises';
import { existsAsync } from '@reciple/utils';
import { parentPort } from 'node:worker_threads';
import { ConfigReader } from './classes/Config.js';
import { config as loadEnv } from 'dotenv';
import { mkdir } from 'node:fs/promises';
import { kleur } from 'fallout-utility';
import path from 'node:path';
import semver from 'semver';
import { CLI } from './classes/CLI.js';

await cli.parse();

if (!await existsAsync(cli.cwd)) await mkdir(cli.cwd, { recursive: true });

if ((cli.cwd !== cli.processCwd && !cli.isCwdUpdated) || parentPort === null) process.chdir(cli.cwd);

loadEnv({ path: cli.flags.env });

const configPaths = ConfigReader.resolveConfigPaths(path.resolve(cli.flags.config ?? 'reciple.mjs'))
const config = await ConfigReader.readConfigJS({ paths: configPaths }).then(c => c.config);
const logger = config.logger instanceof Logger
    ? config.logger
    : config.logger?.enabled
        ? await createLogger(config.logger)
        : null;

global.logger = logger ?? undefined;

if (cli.flags.setup) process.exit(0);
if (cli.shardmode) config.applicationCommandRegister = { ...config.applicationCommandRegister, enabled: false };

config.token = cli.token ?? config.token;

const processErrorHandler = (err: any) => logger?.error(err);

process.once('uncaughtException', processErrorHandler);
process.once('unhandledRejection', processErrorHandler);
process.on('warning', warn => logger?.warn(warn));

if (cli.shardmode) await cli.sendShardProcessInfo();

if (config.version && !semver.satisfies(cliVersion, config.version)) {
    logger?.error(`Your config version doesn't support Reciple CLI v${cliVersion}`);
    process.exit(1);
}

logger?.info(`Starting Reciple client v${buildVersion} - ${new Date().toISOString()}`);

const client = new RecipleClient(config);
global.reciple = client;

client.setLogger(logger);

addEventListenersToClient(client);

const modules = await client.modules.resolveModuleFiles({
    files: await findModules(config.modules, moduleFilesFilter),
    disableVersionCheck: config.modules?.disableModuleVersionCheck
});

const startedModules = await client.modules.startModules();
const failedToStartModules = modules.length - startedModules.length;

if (failedToStartModules > 0) logger?.warn(`Failed to load (${failedToStartModules}) modules.`);

client.once('ready', async () => {
    if (!client.isReady()) return;

    logger?.debug(`Client is ready!`);

    process.removeListener('uncaughtException', processErrorHandler);
    process.removeListener('unhandledRejection', processErrorHandler);

    const loadedModules = await client.modules.loadModules({ cacheCommands: true });
    const failedToLoadModules = startedModules.length - loadedModules.length;

    if (failedToLoadModules > 0) logger?.warn(`Failed to load (${failedToLoadModules}) modules.`);

    let stopping = false;

    const unloadModulesAndStopProcess = async (signal: NodeJS.Signals) => {
        if (stopping) return;

        logger?.debug(`Received exit signal: ${signal}`);

        stopping = true;

        await client.destroy(true);

        const signalString = signal === 'SIGINT' ? 'keyboard interrupt' : signal === 'SIGTERM' ? 'terminate' : String(signal);

        logger?.warn(`Process exited: ${kleur.yellow(signalString)}`);
        logger?.closeWriteStream();

        await setTimeoutAsync(10);
        process.exit(0);
    };

    process.stdin.resume();

    CLI.addExitListener(unloadModulesAndStopProcess);

    client.on('interactionCreate', interaction => {
        if (interaction.isContextMenuCommand()) {
            ContextMenuCommandBuilder.execute({ client, interaction });
        } else if (interaction.isChatInputCommand()) {
            SlashCommandBuilder.execute({ client, interaction });
        }
    });

    client.on('messageCreate', message => {
        MessageCommandBuilder.execute({ client, message });
    });

    if (config.applicationCommandRegister?.enabled !== false) await client.commands.registerApplicationCommands();

    logger?.warn(`Logged in as ${kleur.bold().cyan(client.user.tag)} ${kleur.magenta('(' + client.user.id + ')')}`);

    logger?.log(`Loaded ${client.commands.contextMenuCommands.size} context menu command(s)`);
    logger?.log(`Loaded ${client.commands.messageCommands.size} message command(s)`);
    logger?.log(`Loaded ${client.commands.slashCommands.size} slash command(s)`);
    logger?.log(`Loaded ${client.commands.preconditions.size} global command precondition(s)`);
    logger?.log(`Loaded ${client.commands.halts.size} global command halt(s)`);

    if (!config.checkForUpdates) return;

    updateChecker.on('updateAvailable', data => logger?.warn(`An update is available for ${kleur.cyan(data.package)}: ${kleur.red(data.currentVersion)} ${kleur.gray('->')} ${kleur.green().bold(data.updatedVersion)}`));
    updateChecker.on('updateError', (pkg, error) => logger?.debug(`An error occured while checking for updates for ${pkg}:`, error));
    updateChecker.startCheckInterval(1000 * 60 * 60);
});

logger?.debug(`Logging in...`);

await client.login().then(() => logger?.debug(`Login successful`));
