#!/usr/bin/env node

import { ContextMenuCommandBuilder, Logger, MessageCommandBuilder, SlashCommandBuilder, buildVersion } from '@reciple/core';
import { createLogger, addEventListenersToClient } from './utils/logger.js';
import { ProcessInformation, RecipleClient, findModules } from './index.js';
import { command, cli, cliVersion, updateChecker } from './utils/cli.js';
import { setTimeout as setTimeoutAsync } from 'node:timers/promises';
import { existsAsync, resolveEnvProtocol } from '@reciple/utils';
import { parentPort, threadId } from 'node:worker_threads';
import { ConfigReader } from './classes/Config.js';
import { config as loadEnv } from 'dotenv';
import { mkdir } from 'node:fs/promises';
import { kleur } from 'fallout-utility';
import path from 'node:path';
import semver from 'semver';

command.parse();

if (!await existsAsync(cli.cwd)) await mkdir(cli.cwd, { recursive: true });

if (cli.cwd !== cli.nodeCwd || parentPort === null) {
    process.chdir(cli.cwd);
    cli.isCwdUpdated = true;
}

loadEnv({ path: cli.options.env });

let configPaths = [path.resolve('./reciple.mjs'), path.resolve('./reciple.js')];

const configPath = path.resolve(cli.options.config ?? 'reciple.mjs');
const isCustomPath = !configPaths.includes(configPath) || !!cli.options.config;

if (!isCustomPath) {
    configPaths = configPaths.filter(p => p !== configPath);
    configPaths.unshift(configPath);
} else {
    configPaths = [configPath];
}

const config = await ConfigReader.readConfigJS({ paths: configPaths }).then(c => c.config);
const logger = config.logger instanceof Logger
    ? config.logger
    : config.logger?.enabled
        ? await createLogger(config.logger)
        : null;

if (cli.options.setup) process.exit(0);
if (cli.shardmode) config.applicationCommandRegister = { ...config.applicationCommandRegister, enabled: false };
if (cli.options.token) config.token = resolveEnvProtocol(cli.options.token) ?? config.token;

const processErrorHandler = (err: any) => logger?.error(err);

process.once('uncaughtException', processErrorHandler);
process.once('unhandledRejection', processErrorHandler);

process.on('warning', warn => logger?.warn(warn));

if (cli.shardmode) {
    const message: ProcessInformation = { type: 'ProcessInfo', pid: process.pid, threadId, log: cli.logPath };

    if (parentPort) parentPort.postMessage(message);
    if (process.send) process.send(message);
}

if (config.version && !semver.satisfies(cliVersion, config.version)) {
    logger?.error(`Your config version doesn't support Reciple CLI v${cliVersion}`);
    process.exit(1);
}

logger?.info(`Starting Reciple client v${buildVersion} - ${new Date()}`);

const client = new RecipleClient(config);

client.setLogger(logger);

addEventListenersToClient(client);

const moduleFilesFilter = (file: string) => file.endsWith('.js') || file.endsWith('.cjs') || file.endsWith('.mjs');

const modules = await client.modules.resolveModuleFiles({
    files: await findModules(config.modules, (f) => moduleFilesFilter(f)),
    disableVersionCheck: config.modules?.disableModuleVersionCheck
});

const startedModules = await client.modules.startModules();
const failedToStartModules = modules.length - startedModules.length;

if (failedToStartModules > 0) logger?.error(`Failed to start (${failedToStartModules}) modules.`);

client.once('ready', async () => {
    if (!client.isReady()) return;

    logger?.debug(`Client is ready!`);

    process.removeListener('uncaughtException', processErrorHandler);
    process.removeListener('unhandledRejection', processErrorHandler);

    const loadedModules = await client.modules.loadModules({ cacheCommands: true });
    const failedToLoadModules = startedModules.length - loadedModules.length;

    if (failedToLoadModules > 0) logger?.debug(`Failed to load (${failedToLoadModules}) modules.`);

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

    process.once('SIGHUP', unloadModulesAndStopProcess);
    process.once('SIGINT', unloadModulesAndStopProcess);
    process.once('SIGQUIT', unloadModulesAndStopProcess);
    process.once('SIGABRT',unloadModulesAndStopProcess);
    process.once('SIGALRM', unloadModulesAndStopProcess);
    process.once('SIGTERM', unloadModulesAndStopProcess);
    process.once('SIGBREAK', unloadModulesAndStopProcess);
    process.once('SIGUSR2', unloadModulesAndStopProcess);

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
    logger?.log(`Loaded ${client.commands.preconditions.size} precondition(s)`);

    if (!config.checkForUpdates) return;

    updateChecker.on('updateAvailable', data => logger?.warn(`An update is available for ${kleur.cyan(data.package)}: ${kleur.red(data.currentVersion)} ${kleur.gray('->')} ${kleur.green().bold(data.updatedVersion)}`));
    updateChecker.on('updateError', (pkg, error) => logger?.debug(`An error occured while checking for updates for ${pkg}:`, error));
    updateChecker.startCheckInterval(1000 * 60 * 60);
});

logger?.debug(`Logging in...`);

await client.login().then(() => logger?.debug(`Login successful`));
