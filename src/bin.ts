#!/usr/bin/env node

import { RecipleClient } from './reciple/classes/RecipleClient';
import { RecipleConfig } from './reciple/classes/RecipleConfig';
import { rawVersion } from './reciple/version';
import { existsSync, readdirSync } from 'fs';
import { flags } from './reciple/flags';
import { input } from 'fallout-utility';
import chalk from 'chalk';
import 'dotenv/config';

const allowedFiles = ['node_modules', 'reciple.yml', 'package.json'];

if (readdirSync('./').filter(f => !f.startsWith('.') && allowedFiles.indexOf(f)).length > 0 && !existsSync(flags.config ?? './reciple.yml')) {
    const ask = (flags.yes ? 'y' : null) ?? input('This directory does not contain reciple.yml. Would you like to init axis here? [y/n] ') ?? '';
    if (ask.toString().toLowerCase() !== 'y') process.exit(0);
}

let configParser: RecipleConfig;

try {
    configParser = new RecipleConfig(flags.config ?? './reciple.yml').parseConfig();
} catch (err) {
    console.error(`${chalk.bold.red('Config Error')}: ${chalk.white((err as Error).message)}`);
    process.exit(1);
}

const config = configParser.getConfig();
const client = new RecipleClient({ config: config, ...config.client });

if (config.fileLogging.clientLogs) client.logger.info('Reciple Client v' + rawVersion + ' is starting...');

(async () => {
    await client.startModules();

    client.on('ready', async () => {
        if (client.isClientLogsEnabled()) client.logger.warn(`Logged in as ${client.user?.tag || 'Unknown'}!`);

        await client.loadModules();
        client.addCommandListeners();
    });

    client.login(config.token).catch(err => {
        if (client.isClientLogsEnabled()) client.logger.error(err);
    });
})();
