#!/usr/bin/env node

import { ContextMenuCommandBuilder, MessageCommandBuilder, SlashCommandBuilder, realVersion, version } from '@reciple/client';
import { getModules } from './utils/modules.js';
import { createLogger, eventLogger } from './utils/logger.js';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { Config } from './classes/Config.js';
import { command, cli } from './utils/cli.js';
import { RecipleClient } from './index.js';
import micromatch from 'micromatch';
import prompts from 'prompts';
import semver from 'semver';
import path from 'path';

command.parse();

const allowedFiles = ['node_modules', 'reciple.yml', 'package.json', '.*'];
const configPath = cli.options.config
    ? path.isAbsolute(cli.options.config)
        ? path.resolve(cli.options.config)
        : path.join(cli.cwd, cli.options.config)
    : path.join(cli.cwd, 'reciple.yml');

if (!existsSync(cli.cwd)) mkdirSync(cli.cwd, { recursive: true });
if (readdirSync(cli.cwd).filter(f => !micromatch.isMatch(f, allowedFiles)).length && !existsSync(configPath) && !cli.options.yes) {
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

const configParser = await (new Config(configPath)).parseConfig();
const config = configParser.getConfig();
const logger = config.logger?.enabled ? createLogger(config.logger) : undefined;

if (cli.options.setup) process.exit(0);
if (cli.options.shardmode) config.applicationCommandRegister = { ...config.applicationCommandRegister, enabled: false };

/**
 * !! BREAKING !!
 * TODO: use reciple cli version instead of client version when checking
 */
if (!semver.satisfies(version, config.version)) {
    logger?.error(`Your config version doesn't support Reciple client v${version}`);
    process.exit(1);
}

const client = new RecipleClient({
    recipleOptions: config,
    ...config.client,
    logger
});

client.logger?.info(`Starting Reciple client v${realVersion} - ${new Date()}`);

eventLogger(client);

const moduleFilesFilter = (file: string) => file.endsWith('.js') || file.endsWith('.cjs') || file.endsWith('.mjs');

await client.modules.startModules({
    modules: await client.modules.resolveModuleFiles(await getModules(config.modules, (f) => moduleFilesFilter(f)), config.modules.disableModuleVersionCheck),
    addToModulesCollection: true
});

client.once('ready', async () => {
    const loadedModules = await client.modules.loadModules({
        modules: client.modules.modules.toJSON(),
        resolveCommands: true
    });

    client.modules.modules.sweep(m => !loadedModules.some(s => s.id == m.id));

    const unloadModulesAndStopProcess = async (signal: NodeJS.Signals) => {
        await client.modules.unloadModules({
            reason: 'ProcessExit',
            modules: client.modules.modules.toJSON(),
            removeCommandsFromClient: false,
            removeFromModulesCollection: true
        });


        client.logger?.warn(`Process exited: ${signal === 'SIGINT' ? 'keyboard interrupt' : signal === 'SIGTERM' ? 'terminate' : signal}`);
        process.exit(0);
    };

    process.once('SIGINT', async signal => unloadModulesAndStopProcess(signal));
    process.once('SIGTERM', async signal => unloadModulesAndStopProcess(signal));

    client.on('cacheSweep', () => client.cooldowns.clean());

    await client.commands.registerApplicationCommands();

    client.logger?.warn(`Logged in as ${client.user?.tag} (${client.user?.id})`);

    client.logger?.log(`Loaded ${client.commands.contextMenuCommands.size} context menu commands`);
    client.logger?.log(`Loaded ${client.commands.messageCommands.size} message commands`);
    client.logger?.log(`Loaded ${client.commands.slashCommands.size} slash commands`);

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

await client.login(config.token).catch(err => client.logger?.error(err));
