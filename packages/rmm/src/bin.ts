#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync } from 'fs';
import { Registry, cacheDir, cli, commandsDir, packageJson } from './index.js';
import { path } from 'fallout-utility';
import chalk from 'chalk';
import { logger } from './utils/logger.js';

if (!existsSync(commandsDir)) mkdirSync(commandsDir, { recursive: true });
if (!existsSync(cacheDir)) mkdirSync(commandsDir, { recursive: true });

const commandFiles = readdirSync(commandsDir).filter(f => f.endsWith('.js')).map(f => path.join(commandsDir, f));

logger.log(chalk.bold(`Reciple module manager v${packageJson.version}`));

const repository = new Registry();

for (const commandFile of commandFiles) {
    try {
        const commandInit = await import(commandFile);
        const command = commandInit?.default ?? commandInit;
        if (typeof command !== 'function') throw new Error('Invalid command file');

        await Promise.resolve(command(repository));
    } catch (err) {
        logger.debug(`Failed to load command file '${commandFile}':\n`, err);
        continue;
    }
}

await cli.parseAsync();
