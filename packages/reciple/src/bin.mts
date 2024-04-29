#!/usr/bin/env node

import { Logger, buildVersion } from '@reciple/core';
import { createLogger } from './utils/logger.js';
import { command, cli, cliVersion } from './utils/cli.js';
import { ProcessInformation, RecipleClient } from './index.js';
import { existsAsync, resolveEnvProtocol } from '@reciple/utils';
import { ConfigReader } from './classes/Config.js';
import { config as loadEnv } from 'dotenv';
import { mkdir } from 'node:fs/promises';
import { parentPort, threadId } from 'node:worker_threads';
import path from 'node:path';
import semver from 'semver';
import { watch } from 'chokidar';
import { createClient } from './utils/modules.js';
import { spawn } from 'node:child_process';

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
const watcher = config.watch?.enabled ? watch(config.watch?.include ?? '.') : null;

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

let client = new RecipleClient(config);

await initializeClient();

watcher?.on('all', async event => {
    if (config.watch?.reloadTriggerEvent && config.watch?.reloadTriggerEvent !== 'all' && config.watch?.reloadTriggerEvent !== event) return;

    if (config.watch?.preLoadScript) {
        const child = spawn('npm', ['run', config.watch.preLoadScript], {
            cwd: cli.cwd,
            env: process.env,
            stdio: ['ignore', 'inherit', 'inherit']
        });

        const code = await new Promise(res => child.on('exit', code => res(code)));
        if (code) {
            logger?.error(`Watch pre-load script exited with code (${code})`);
            return;
        }
    }

    await initializeClient();
})

async function initializeClient() {
    process.once('uncaughtException', processErrorHandler);
    process.once('unhandledRejection', processErrorHandler);

    if (client) {
        await client.destroy(true);
        console.clear();
    }

    client = await createClient(config, logger);

    process.removeListener('uncaughtException', processErrorHandler);
    process.removeListener('unhandledRejection', processErrorHandler);
}
