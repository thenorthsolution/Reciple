#!/usr/bin/env node

import { RecipleClient } from './reciple/classes/RecipleClient.js';
import { RecipleConfig } from './reciple/classes/RecipleConfig.js';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { rawVersion } from './reciple/version.js';
import { cwd, flags } from './reciple/flags.js';
import { path } from './reciple/util.js';
import { input } from 'fallout-utility';
import match from 'micromatch';
import { inspect } from 'util';
import chalk from 'chalk';
import 'dotenv/config';
import { Events } from 'discord.js';

const allowedFiles = ['node_modules', 'reciple.yml', 'package.json', '.*'];
const configPath = path.join(cwd, 'reciple.yml');

if (!existsSync(cwd)) mkdirSync(cwd, { recursive: true });
if (readdirSync(cwd).some(f => match.isMatch(f, allowedFiles)) && !existsSync(flags.config ?? configPath)) {
    const ask = (flags.yes ? 'y' : null) ?? input('Would you like to create Reciple config here? [y/n] ') ?? '';
    if (ask.toString().toLowerCase() !== 'y') process.exit(0);
}

let configParser: RecipleConfig;

try {
    configParser = new RecipleConfig(flags.config ?? configPath).parseConfig();
} catch (err) {
    console.error(`${chalk.bold.red('Config Error')}: ${inspect(err)}`);
    process.exit(1);
}

const config = configParser.getConfig();
const client = new RecipleClient({ config: config, cwd, ...config.client });

/**
 * Start
 */

if (!client.isClientLogsSilent) client.logger.info('Starting Reciple client v' + rawVersion);

client.addCommandListeners();

await client.modules.startModules({
    modules: await client.modules.resolveModuleFiles({
        files: await client.modules.getModulePaths({
            filter: file => file.endsWith('.js') || file.endsWith('.cjs') || file.endsWith('.mjs'),
        }),
    }),
});

client.on(Events.ClientReady, async () => {
    const failedModuleds = await client.modules.loadModules();

    client.modules.modules.sweep(m => failedModuleds.some(fm => fm.id === m.id));

    const unloadModulesAndStopProcess = async (signal: NodeJS.Signals) => {
        const unloadedModules = await client.modules.unloadModules({ reason: 'ProcessExit' });

        client.modules.modules.sweep(m => unloadedModules.some(fm => fm.id === m.id));

        client.logger.warn(`Exitting process${signal === 'SIGINT' ? ': keyboard interrupt' : signal === 'SIGTERM' ? ': terminate' : signal}`);
        process.exit();
    };

    process.once('SIGINT', signal => unloadModulesAndStopProcess(signal));
    process.once('SIGTERM', signal => unloadModulesAndStopProcess(signal));

    if (!client.isClientLogsSilent) client.logger.log(`Loaded ${client.commands.slashCommands.size} slash commands`, `Loaded ${client.commands.messageCommands.size} message commands`);
    if (client.config.commands.slashCommand.registerCommands && (client.config.commands.slashCommand.allowRegisterEmptyCommandList || client.applicationCommands.size)) {
        await client.commands.registerApplicationCommands();
    }

    if (!client.isClientLogsSilent) client.logger.warn(`Logged in as ${client.user?.tag || 'Unknown'}!`);

    client.on(Events.CacheSweep, () => client.cooldowns.clean());
});

client.login(config.token).catch(err => {
    if (!client.isClientLogsSilent) client.logger.error(err);
});
