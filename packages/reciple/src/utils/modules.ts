import { lstat, mkdir, readdir } from 'node:fs/promises';
import { Logger, Awaitable, kleur } from 'fallout-utility';
import { buildVersion, ContextMenuCommandBuilder, MessageCommandBuilder, SlashCommandBuilder } from '@reciple/core';
import { RecipleConfig } from '../classes/Config';
import { addEventListenersToClient } from './logger';
import micromatch from 'micromatch';
import path from 'node:path';
import { existsAsync } from '@reciple/utils';
import { setTimeout as setTimeoutAsync } from 'node:timers/promises';
import { checkForUpdates, RecipleClient } from '..';

export const defaultModuleFilesFilter = (file: string) => file.endsWith('.js') || file.endsWith('.cjs') || file.endsWith('.mjs');

export async function findModules(config: RecipleConfig['modules'], filter?: (filename: string) => Awaitable<boolean>): Promise<string[]> {
    const modules: string[] = [];
    const { globby, isDynamicPattern } = await import('globby');

    for (const folder of config?.dirs ?? []) {
        const dir = path.isAbsolute(folder) ? folder : path.join(process.cwd(), folder);

        if (isDynamicPattern(folder, { cwd: process.cwd() })) {
            let dirs = await globby(folder, {
                    cwd: process.cwd(),
                    onlyDirectories: true,
                    absolute: true
                });

                if (config?.exclude?.length) dirs = dirs.filter(f => !micromatch.isMatch(path.basename(f), config.exclude!));

            modules.push(...await findModules({
                ...config,
                dirs
            }));

            continue;
        }

        if (!await existsAsync(dir)) await mkdir(dir, { recursive: true });
        if (!(await lstat(dir)).isDirectory()) continue;

        const files = (await readdir(dir))
            .map(file => path.join(dir, file))
                .filter(f => !config?.exclude?.length || !micromatch.isMatch(path.basename(f), config.exclude)
            )
            .filter(file => (filter ? filter(file) : file.endsWith('.js')));

        const addFile = async (file: string) => !config?.filter || await Promise.resolve(config.filter(file)) ? modules.push(file) : 0;

        await Promise.all(files.map(f => addFile(f)));
    }

    return modules;
}

export async function createClient(config: RecipleConfig, logger?: Logger|null): Promise<RecipleClient> {
    const client = new RecipleClient(config);

    if (logger) client.setLogger(logger);

    logger?.info(`Starting Reciple client v${buildVersion} - ${new Date()}`);

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

    logger?.debug(`Logging in...`);

    await client.login().then(() => logger?.debug(`Login successful`));
    return client;
}
