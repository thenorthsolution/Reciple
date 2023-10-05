#!/usr/bin/env node

import { ContextMenuCommandBuilder, MessageCommandBuilder, SlashCommandBuilder, buildVersion, version } from '@reciple/core';
import { setTimeout as setTimeoutAsync } from 'node:timers/promises';
import { createLogger, addEventListenersToClient } from './utils/logger.js';
import { checkLatestUpdate } from '@reciple/update-checker';
import { command, cli, cliVersion } from './utils/cli.js';
import { mkdir } from 'node:fs/promises';
import { ConfigReader } from './classes/Config.js';
import { RecipleClient, findModules } from './index.js';
import { kleur } from 'fallout-utility';
import { existsSync } from 'node:fs';
import path from 'node:path';
import semver from 'semver';
import { config as loadEnv } from 'dotenv';

command.parse();

if (!existsSync(cli.cwd)) await mkdir(cli.cwd, { recursive: true });
process.chdir(cli.cwd);

loadEnv({ path: cli.options.env });

const configPath = path.resolve(cli.options.config);
const config = await ConfigReader.readConfigJS(configPath).then(c => c.config);
const logger = config.logger?.enabled ? await createLogger(config.logger) : null;

if (cli.options.setup) process.exit(0);
if (cli.options.shardmode) config.applicationCommandRegister = { ...config.applicationCommandRegister, enabled: false };

const processErrorHandler = (err: any) => logger?.error(err);

process.once('uncaughtException', processErrorHandler);
process.once('unhandledRejection', processErrorHandler);

process.on('warning', warn => logger?.warn(warn));

if (!semver.satisfies(version, config.version)) {
    logger?.error(`Your config version doesn't support Reciple client v${version}`);
    process.exit(1);
}

logger?.info(`Starting Reciple client v${buildVersion} - ${new Date()}`);

const client = new RecipleClient(config);

client.setLogger(logger)

addEventListenersToClient(client);

const moduleFilesFilter = (file: string) => file.endsWith('.js') || file.endsWith('.cjs') || file.endsWith('.mjs');

const modules = await client.modules.resolveModuleFiles({
    files: await findModules(config.modules, (f) => moduleFilesFilter(f)),
    disableVersionCheck: config.modules.disableModuleVersionCheck
});

const startedModules = await client.modules.startModules();
const failedToStartModules = modules.length - startedModules.length;

if (failedToStartModules > 0) logger?.error(`Failed to start (${failedToStartModules}) modules.`);

client.once('ready', async () => {
    if (!client.isReady()) return;

    console.log(client);

    logger?.debug(`Client is ready!`);

    process.removeListener('uncaughtException', processErrorHandler);
    process.removeListener('unhandledRejection', processErrorHandler);

    if (config.checkForUpdates !== false) {
        checkLatestUpdate('reciple', cliVersion)
            .then(data => {
                logger?.debug(`Update checked! `, data);
                return data;
            })
            .then(data => data.currentVersion !== data.updatedVersion ? logger?.warn(
                `A new updated version of Reciple is available! Update from ${kleur.red(data.currentVersion)} to ${kleur.green(data.updatedVersion)}:\n` +
                `   ${kleur.bold().cyan('npm i reciple@' + data.updatedVersion)}`
            ) : null)
            .catch(() => null);
    }

    const loadedModules = await client.modules.loadModules({ cacheCommands: true });
    const failedToLoadModules = startedModules.length - loadedModules.length;

    if (failedToLoadModules > 0) logger?.debug(`Failed to load (${failedToLoadModules}) modules.`);

    let stopping = false;

    const unloadModulesAndStopProcess = async (signal: NodeJS.Signals) => {
        if (stopping) return;

        logger?.debug(`Received exit signal: ${signal}`);

        stopping = true;

        await client.modules.unloadModules({
            reason: 'ProcessExit',
            removeFromCache: true,
            removeModuleCommands: true
        });

        await client.destroy();

        const signalString = signal === 'SIGINT' ? 'keyboard interrupt' : signal === 'SIGTERM' ? 'terminate' : String(signal);

        logger?.warn(`Process exited: ${kleur.yellow(signalString)}`);
        logger?.closeWriteStream();

        await setTimeoutAsync(10);
        process.kill(process.pid, signal);
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

    await client.commands.registerApplicationCommands();

    logger?.warn(`Logged in as ${kleur.bold().cyan(client.user.tag)} ${kleur.magenta('(' + client.user.id + ')')}`);

    logger?.log(`Loaded ${client.commands.contextMenuCommands.size} context menu command(s)`);
    logger?.log(`Loaded ${client.commands.messageCommands.size} message command(s)`);
    logger?.log(`Loaded ${client.commands.slashCommands.size} slash command(s)`);
});

logger?.debug(`Logging in...`);

await client.login().then(() => logger?.debug(`Login successful`));
