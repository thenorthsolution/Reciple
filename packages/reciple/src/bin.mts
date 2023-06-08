#!/usr/bin/env node

import { ContextMenuCommandBuilder, MessageCommandBuilder, SlashCommandBuilder, realVersion, version } from '@reciple/client';
import { getJsConfig, getModules } from './utils/modules.js';
import { createLogger, eventLogger } from './utils/logger.js';
import { checkLatestUpdate } from '@reciple/update-checker';
import { CacheFactory, SweeperOptions } from 'discord.js';
import { command, cli, cliVersion } from './utils/cli.js';
import { mkdir, readdir } from 'fs/promises';
import { setTimeout } from 'timers/promises';
import { Config } from './classes/Config.js';
import { RecipleClient } from './index.js';
import micromatch from 'micromatch';
import { existsSync } from 'fs';
import prompts from 'prompts';
import semver from 'semver';
import kleur from 'kleur';
import path from 'path';

command.parse();

const allowedFiles = ['node_modules', 'reciple.yml', 'package.json', '.*'];
let configPaths = cli.options?.config?.map(c => path.isAbsolute(c) ? path.resolve(c) : path.join(cli.cwd, c));
    configPaths = !configPaths?.length ? [path.join(cli.cwd, 'reciple.yml')] : configPaths;

const mainConfigPath = configPaths.shift()!;

if (!existsSync(cli.cwd)) await mkdir(cli.cwd, { recursive: true });
if ((await readdir(cli.cwd)).filter(f => !micromatch.isMatch(f, allowedFiles)).length && !existsSync(mainConfigPath) && !cli.options.yes) {
    const confirm = await prompts(
        {
            initial: false,
            message: `Would you like to initialize your Reciple app ${cli.cwd !== process.cwd() ? 'in your chosen directory': 'here'}?`,
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

if (config.checkForUpdates !== false) {
    checkLatestUpdate('reciple', cliVersion)
        .then(data => data.currentVersion !== data.updatedVersion ? logger?.warn(
            `A new updated version of Reciple is available! Update from ${kleur.red(data.currentVersion)} to ${kleur.green(data.updatedVersion)}:\n` +
            `   ${kleur.bold().cyan('npm i reciple@' + data.updatedVersion)}`
        ) : null)
        .catch(() => null);
}

const client = new RecipleClient({
    recipleOptions: config,
    ...config.client,
    logger,
    makeCache: cli.options.cacheConfig ? await getJsConfig<CacheFactory>(cli.options.cacheConfig) : undefined,
    sweepers: cli.options.sweeperConfig ? await getJsConfig<SweeperOptions>(cli.options.sweeperConfig) : undefined,
});

eventLogger(client);

const moduleFilesFilter = (file: string) => file.endsWith('.js') || file.endsWith('.cjs') || file.endsWith('.mjs');

await client.modules.startModules({
    modules: await client.modules.resolveModuleFiles(await getModules(config.modules, (f) => moduleFilesFilter(f)), config.modules.disableModuleVersionCheck),
    addToModulesCollection: true
});

client.once('ready', async () => {
    process.removeListener('uncaughtException', processErrorHandler);
    process.removeListener('unhandledRejection', processErrorHandler);

    const loadedModules = await client.modules.loadModules({
        modules: client.modules.modules.toJSON(),
        resolveCommands: true
    });

    const unloaded = client.modules.modules.sweep(m => !loadedModules.some(s => s.id == m.id));

    client.logger?.debug(`Failed to load (${unloaded}) modules.`);

    let stopping = false;

    const unloadModulesAndStopProcess = async (signal: NodeJS.Signals) => {
        if (stopping) return;

        stopping = true;

        await client.modules.unloadModules({
            reason: 'ProcessExit',
            modules: client.modules.modules.toJSON(),
            removeCommandsFromClient: false,
            removeFromModulesCollection: true
        });

        client.destroy();

        const signalString = signal === 'SIGINT' ? 'keyboard interrupt' : signal === 'SIGTERM' ? 'terminate' : String(signal);

        client.logger?.warn(`Process exited: ${kleur.yellow(signalString)}`);

        await setTimeout(10);
        process.exit(0);
    };

    process.once('SIGINT', signal => unloadModulesAndStopProcess(signal));
    process.once('SIGTERM', signal => unloadModulesAndStopProcess(signal));
    process.once('SIGHUP', signal => unloadModulesAndStopProcess(signal));

    client.logger?.debug(`Deploying application commands...`);
    await client.commands.registerApplicationCommands();

    client.logger?.warn(`Logged in as ${kleur.bold().cyan(client.user!.tag)} ${kleur.magenta('(' + client.user!.id + ')')}`);

    client.logger?.log(`Loaded ${client.commands.contextMenuCommands.size} context menu command(s)`);
    client.logger?.log(`Loaded ${client.commands.messageCommands.size} message command(s)`);
    client.logger?.log(`Loaded ${client.commands.slashCommands.size} slash command(s)`);

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
});

client.logger?.debug(`Logging in...`);

await client.login(config.token)
    .then(() => client.logger?.debug(`Login successful`))
    .catch(err => client.logger?.error(err));
