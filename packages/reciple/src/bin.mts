#!/usr/bin/env node

import { ContextMenuCommandBuilder, Logger, MessageCommandBuilder, RecipleError, SlashCommandBuilder, buildVersion } from '@reciple/core';
import { createLogger } from './utils/logger.js';
import { command, cli, cliVersion, checkForUpdates } from './utils/cli.js';
import { ProcessInformation, RecipleClient } from './index.js';
import { existsAsync, resolveEnvProtocol } from '@reciple/utils';
import { ConfigReader } from './classes/Config.js';
import { config as loadEnv } from 'dotenv';
import { mkdir } from 'node:fs/promises';
import { parentPort, threadId } from 'node:worker_threads';
import path from 'node:path';
import semver from 'semver';
import { watch } from 'chokidar';
import { defaultModuleFilesFilter, findModules } from './utils/modules.js';
import { addEventListenersToClient } from './utils/logger.js';
import { spawn } from 'node:child_process';
import { kleur } from 'fallout-utility';
import { setTimeout as setTimeoutAsync } from 'node:timers/promises';

command.parse();

if (!await existsAsync(cli.cwd)) await mkdir(cli.cwd, { recursive: true });

if (cli.cwd !== cli.nodeCwd || parentPort === null) {
    process.chdir(cli.cwd);
    cli.isCwdUpdated = true;
}

loadEnv({ path: cli.options.env });

let configPaths = [path.resolve('./reciple.mjs'), path.resolve('./reciple.cjs'), path.resolve('./reciple.js')];

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
const watcher = cli.options.watch ? watch(config.watch?.include ?? '.', {
    ignored: config.watch?.ignored,
    cwd: cli.cwd
}) : null;

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

let initializing: boolean = false;
let publicClient: RecipleClient|null = null;

await initializeClient();

watcher?.on('all', async event => {
    if (config.watch?.reloadTriggerEvent && config.watch?.reloadTriggerEvent !== 'all' && config.watch?.reloadTriggerEvent !== event) return;
    if (initializing) return;

    if (config.watch?.preLoadScript) {
        try {
            const child = spawn('npm', ['run', config.watch.preLoadScript], {
                cwd: cli.cwd,
                env: process.env,
                stdio: ['ignore', 'inherit', 'inherit']
            });

            const code = await new Promise((res, rej) => {
                child.on('exit', res);
                child.on('error', rej);
            });

            if (code) throw new RecipleError(`Watch pre-load script exited with code (${code})`);
        } catch (err) {
            logger?.error(`An error occured executing pre-load script:`, err);
            return;
        }
    }

    await initializeClient();
});

async function initializeClient() {
    process.once('uncaughtException', processErrorHandler);
    process.once('unhandledRejection', processErrorHandler);

    if (publicClient) {
        await publicClient.destroy(true);
        publicClient = null;
        initializing = true;
    }

    if (watcher) {
        logger?.info(kleur.cyan().bold(`\nCurrently On Watch Mode!`));
        logger?.info(kleur.green(`Listening to file changes...\n`));
    }

    logger?.info(`Starting Reciple client v${buildVersion} - ${new Date()}`);

    const client = new RecipleClient(config);
    if (logger) client.setLogger(logger);

    addEventListenersToClient(client);

    const modules = await client.modules.resolveModuleFiles({
        files: await findModules(config.modules, (f) => defaultModuleFilesFilter(f)),
        disableVersionCheck: config.modules?.disableModuleVersionCheck
    });

    const startedModules = await client.modules.startModules();
    const failedToStartModules = modules.length - startedModules.length;

    if (failedToStartModules > 0) logger?.error(`Failed to start (${failedToStartModules}) modules.`);

    client.once('ready', async () => {
        if (!client.isReady()) return;

        logger?.debug(`Client is ready!`);

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
            await watcher?.close();
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

        if (config.checkForUpdates) await checkForUpdates(logger ?? undefined);
    });

    await client.login().then(() => logger?.debug(`Login successful`));

    publicClient = client;
    initializing = false;

    process.removeListener('uncaughtException', processErrorHandler);
    process.removeListener('unhandledRejection', processErrorHandler);
}
