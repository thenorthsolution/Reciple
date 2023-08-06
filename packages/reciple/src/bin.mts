#!/usr/bin/env node

import { ContextMenuCommandBuilder, MessageCommandBuilder, SlashCommandBuilder, realVersion, version } from '@reciple/client';
import { setTimeout as setTimeoutAsync } from 'node:timers/promises';
import { createLogger, eventLogger } from './utils/logger.js';
import { getJsConfig, getModules } from './utils/modules.js';
import { checkLatestUpdate } from '@reciple/update-checker';
import { CacheFactory, SweeperOptions } from 'discord.js';
import { command, cli, cliVersion } from './utils/cli.js';
import { mkdir, readdir } from 'node:fs/promises';
import { Config } from './classes/Config.js';
import { RecipleClient } from './index.js';
import { kleur } from 'fallout-utility';
import { existsSync } from 'node:fs';
import micromatch from 'micromatch';
import prompts from 'prompts';
import path from 'node:path';
import semver from 'semver';

command.parse();
process.chdir(cli.cwd);

const allowedFiles = ['node_modules', 'reciple.yml', 'package.json', '.*'];
let configPaths = cli.options?.config?.map(c => path.isAbsolute(c) ? path.resolve(c) : path.join(process.cwd(), c));
    configPaths = !configPaths?.length ? [path.join(process.cwd(), 'reciple.yml')] : configPaths;

const mainConfigPath = configPaths.shift()!;

if (!existsSync(process.cwd())) await mkdir(process.cwd(), { recursive: true });
if ((await readdir(process.cwd())).filter(f => !micromatch.isMatch(f, allowedFiles)).length && !existsSync(mainConfigPath) && !cli.options.yes) {
    const confirm = await prompts(
        {
            initial: false,
            message: `Would you like to initialize your Reciple app ${process.cwd() !== process.cwd() ? 'in your chosen directory': 'here'}?`,
            name: 'confirm',
            type: 'confirm'
        }
    );

    if (!confirm.confirm) process.exit(0);
}

const configParser = await (new Config(mainConfigPath, configPaths)).parseConfig();
const config = configParser.getConfig();
const logger = config.logger?.enabled ? await createLogger(config.logger) : undefined;

if (cli.options.setup) process.exit(0);
if (cli.options.shardmode) config.applicationCommandRegister = { ...config.applicationCommandRegister, enabled: false };

const processErrorHandler = (err: any) => logger?.error(err);

process.once('uncaughtException', processErrorHandler);
process.once('unhandledRejection', processErrorHandler);

process.on('warning', warn => logger?.warn(warn));

/**
 * !! BREAKING !!
 * TODO: use reciple cli version instead of client version when checking
 */
if (!semver.satisfies(version, config.version)) {
    logger?.error(`Your config version doesn't support Reciple client v${version}`);
    process.exit(1);
}

logger?.info(`Starting Reciple client v${realVersion} - ${new Date()}`);

const client = new RecipleClient({
    recipleOptions: config,
    ...config.client,
    logger,
    makeCache: cli.options.cacheConfig ? await getJsConfig<CacheFactory>(cli.options.cacheConfig) : undefined,
    sweepers: cli.options.sweeperConfig ? await getJsConfig<SweeperOptions>(cli.options.sweeperConfig) : undefined,
});

eventLogger(client);

const moduleFilesFilter = (file: string) => file.endsWith('.js') || file.endsWith('.cjs') || file.endsWith('.mjs');

const modules = await client.modules.resolveModuleFiles(await getModules(config.modules, (f) => moduleFilesFilter(f)), config.modules.disableModuleVersionCheck);
const startedModules = await client.modules.startModules({
    modules,
    addToModulesCollection: true
});

const failedToStartModules = modules.length - startedModules.length;

logger?.debug(`Failed to start (${failedToStartModules}) modules.`);

client.once('ready', async () => {
    if (!client.isReady()) {
        client.logger?.error(`Client did not start properly!`);
        return process.exit(1);
    }

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

    const loadedModules = await client.modules.loadModules({
        modules: [...client.modules.cache.values()],
        resolveCommands: true
    });

    const unloaded = client.modules.cache.sweep(m => !loadedModules.some(s => s.id == m.id));

    client.logger?.debug(`Failed to load (${unloaded}) modules.`);

    let stopping = false;

    const unloadModulesAndStopProcess = async (signal: NodeJS.Signals) => {
        if (stopping) return;

        client.logger?.debug(`Received exit signal: ${signal}`);

        stopping = true;

        await client.modules.unloadModules({
            reason: 'ProcessExit',
            modules: [...client.modules.cache.values()],
            removeCommandsFromClient: false,
            removeFromModulesCollection: true
        });

        client.destroy();

        const signalString = signal === 'SIGINT' ? 'keyboard interrupt' : signal === 'SIGTERM' ? 'terminate' : String(signal);

        client.logger?.warn(`Process exited: ${kleur.yellow(signalString)}`);
        client.logger?.closeWriteStream();

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
            ContextMenuCommandBuilder.execute(client, interaction);
        } else if (interaction.isChatInputCommand()) {
            SlashCommandBuilder.execute(client, interaction);
        }
    });

    client.on('messageCreate', message => {
        MessageCommandBuilder.execute(client, message);
    });

    await client.commands.registerApplicationCommands();

    client.logger?.warn(`Logged in as ${kleur.bold().cyan(client.user.tag)} ${kleur.magenta('(' + client.user.id + ')')}`);

    client.logger?.log(`Loaded ${client.commands.contextMenuCommands.size} context menu command(s)`);
    client.logger?.log(`Loaded ${client.commands.messageCommands.size} message command(s)`);
    client.logger?.log(`Loaded ${client.commands.slashCommands.size} slash command(s)`);
});

client.logger?.debug(`Logging in...`);

await client.login(config.token)
    .then(() => client.logger?.debug(`Login successful`))
    .catch(err => client.logger?.error(err));
