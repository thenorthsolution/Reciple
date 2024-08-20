import { cliBuildVersion, cliVersion } from '../types/constants.js';
import { EventHandlers } from '../classes/EventHandlers.js';
import { ModuleLoader } from '../classes/ModuleLoader.js';
import { resolveEnvProtocol } from '@reciple/utils';
import { Config } from '../classes/Config.js';
import { buildVersion } from '@reciple/core';
import { RecipleClient } from '../index.js';
import type { Command } from 'commander';
import { kleur } from 'fallout-utility';
import { CLI } from '../classes/CLI.js';
import { Logger } from 'prtyprnt';
import semver from 'semver';

export interface CLIStartFlags {
    token?: string;
    config: string;
    production?: boolean;
}

export default (command: Command, cli: CLI) => command
    .command('start', { isDefault: true })
    .description('Starts the bot')
    .option('-t, --token <DiscordToken>', 'Set your Discord Bot token')
    .option('-c, --config <file>', 'Set the config file path', 'reciple.mjs')
    .allowUnknownOption(true)
    .action(async () => {
        let logger: Logger|null = cli.logger ?? null;

        const processErrorLogger = (err: any) => {
            logger?.error(err);
            process.exit(1);
        };

        process.once('uncaughtException', processErrorLogger);
        process.once('unhandledRejection', processErrorLogger);
        process.on('warning', warn => logger?.warn(warn));

        const flags = cli.getFlags<CLIStartFlags>('start', true)!;
        const config = await Config.readConfigFile({ path: flags.config, createIfNotExists: false }).then(config => config?.config);

        if (!config) {
            logger?.error(`No config file found! Run ${kleur.green(`reciple init`)} to create one`);
            process.exit(1);
        }

        logger = config.logger instanceof Logger
            ? config.logger
            : config.logger?.enabled
                ? cli.logger?.clone(await Config.createLoggerOptions(config, { ...cli.logger.toJSON(), label: 'Reciple' }, cli)) || null
                : null;

        logger?.log(`Starting ${kleur.green('reciple@' + kleur.dim(cliBuildVersion) + ' @reciple/client@' + kleur.dim(buildVersion))} - ${kleur.dim(new Date().toISOString())}`);

        if (!cli.shardDeployCommands) {
            config.applicationCommandRegister = { ...config.applicationCommandRegister, enabled: false };
        }

        if (cli.shardMode) await cli.sendProcessInfo();

        config.token = flags.token ? resolveEnvProtocol(flags.token) ?? '' : config.token;

        if (config.version && !semver.satisfies(cliVersion, config.version)) {
            logger?.error(`Your config version doesn't support Reciple CLI v${cliVersion}`);
            process.exit(1);
        }

        const client = new RecipleClient(config);

        global.reciple = client;
        if (logger) global.logger = logger;

        client.setLogger(logger);

        EventHandlers.addClientEvents(client);

        const modules = config.modules
            ? await client.modules.resolveModuleFiles({
                files: await ModuleLoader.getModulePaths({
                    config: config.modules,
                    cwd: cli.cwd,
                    filter: ModuleLoader.defaultModulePathsFilter
                }),
                disableVersionCheck: config.modules?.disableModuleVersionCheck
            })
            : [];

        const startData = await ModuleLoader.startModules(client, modules);
        if (startData.failed.length) logger?.error(`Failed to start ${startData.failed.length} module(s):\n    ${startData.failed.map(m => m.displayName).join('\n    ')}`);

        client.on('ready', async () => {
            if (!client.isReady()) return;

            logger?.debug(`Client is ready!`);

            process.removeListener('uncaughtException', processErrorLogger);
            process.removeListener('unhandledRejection', processErrorLogger);

            const loadData = await ModuleLoader.loadModules(client, modules);
            if (loadData.failed.length) logger?.error(`Failed to load ${loadData.failed.length} module(s):\n    ${loadData.failed.map(m => m.displayName).join('\n    ')}`);

            process.stdin.resume();

            EventHandlers.addExitListener((signal: NodeJS.Signals) => ModuleLoader.processExitHandleModuleUnload(client, signal));
            EventHandlers.addCommandExecuteHandlers(client);

            if (config.applicationCommandRegister?.enabled !== false) await client.commands.registerApplicationCommands();

            logger?.warn(`Logged in as ${kleur.bold().cyan(client.user.tag)} ${kleur.magenta('(' + client.user.id + ')')}`);

            logger?.log(`Loaded ${client.commands.contextMenuCommands.size} context menu command(s)`);
            logger?.log(`Loaded ${client.commands.messageCommands.size} message command(s)`);
            logger?.log(`Loaded ${client.commands.slashCommands.size} slash command(s)`);
            logger?.log(`Loaded ${client.commands.preconditions.size} global command precondition(s)`);
            logger?.log(`Loaded ${client.commands.halts.size} global command halt(s)`);

            if (!config.checkForUpdates) cli.updateChecker?.stopCheckInterval();
        });

        logger?.debug(`Logging in...`);

        await client.login().then(() => logger?.debug(`Login successful`));
    });
