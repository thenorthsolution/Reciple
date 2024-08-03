import type { Command } from 'commander';
import { CLI } from '../classes/CLI.js';
import { Logger } from '@reciple/core';
import type { CLIStartFlags } from './start.js';
import { Config, EventHandlers } from '../exports.js';
import { watch, type FSWatcher } from 'chokidar';
import { fork, type ChildProcess } from 'node:child_process';
import { kleur } from 'fallout-utility';
import micromatch from 'micromatch';

export interface CLIDevFlags extends CLIStartFlags {
    watch?: string[];
    ignore?: string[];
    exec?: string[];
    nostart: boolean;
    killSignal?: NodeJS.Signals;
}

export default (command: Command, cli: CLI) => command
    .command('dev')
    .description('Starts the bot in development mode')
    .option('-t, --token <DiscordToken>', 'Set your Discord Bot token')
    .option('-c, --config <file>', 'Set the config file path', 'reciple.mjs')
    .option('--watch <files>', 'Files to watch for changes', (v, p: string[]) => p.concat(v), [])
    .option('--ignore <files>', 'Files to ignore', (v, p: string[]) => p.concat(v), [])
    .option('--exec <script>', 'Execute a script', (v, p: string[]) => p.concat(v), [])
    .option('--nostart', 'Do not start the bot')
    .option('--killSignal <signal>', 'Signal to send to the child process', 'SIGINT')
    .allowUnknownOption(true)
    .action(async () => {
        let logger: Logger|null = cli.logger ?? null;

        if (logger) logger.label = 'Dev';

        const startFlags = CLI.stringifyFlags(cli.getFlags<CLIDevFlags>('dev')!, cli.getCommand('dev')!);
        const recipleFlags = CLI.stringifyFlags(cli.getFlags(), cli.getCommand(), ['cwd']);
        const processFlags = [...startFlags, ...recipleFlags];

        const flags = cli.getFlags<CLIDevFlags>('dev')!;

        let defaultConfig = (await Config.getDefaultConfigData()).devmode;
        let config = await Config.readConfigFile({ path: flags.config, createIfNotExists: false }).then(config => config?.devmode);
        let watcher: FSWatcher|null = null;
        let childProcess: ChildProcess|null = null;
        let throttle: NodeJS.Timeout|null = null;
        let hardRefreshTargets: string[] = ['package.json', '.env*', 'tsconfig.json', 'reciple.*js'];

        await createWatcher();

        async function createWatcher() {
            if (watcher) {
                watcher.removeAllListeners();
                watcher.close();
                watcher = null;
            }

            if (throttle) {
                clearTimeout(throttle);
                throttle = null;
            }

            logger?.debug(`Starting chokidar watcher...`);

            watcher = watch(config?.watch ?? defaultConfig?.watch ?? cli.cwd, {
                ignored: config?.ignore ?? defaultConfig?.ignore,
                ignoreInitial: true,
                cwd: cli.cwd,
                alwaysStat: true
            });

            await new Promise(resolve => watcher?.on('ready', resolve));
            logger?.debug(`Chokidar watcher is ready!`);

            throttle = setTimeout(() => createChildProcess(), 0);

            watcher.on('all', (event, target, stats) => {
                logger?.debug(`Chokidar event: ${kleur.cyan(event)}; target: ${kleur.green().dim(target)}`);

                if (throttle) {
                    clearTimeout(throttle);
                    throttle = null;
                }

                throttle = setTimeout(async () => {
                    if (target && micromatch([target], hardRefreshTargets).length > 0) {
                        logger?.debug(`Hard refreshing...`);
                        await createWatcher();
                        return;
                    }

                    await createChildProcess();
                }, 1000);
            });
        }

        async function killChildProcess(): Promise<void> {
            if (!childProcess) return;

            const pid = childProcess.pid;

            logger?.debug(`Killing child process: ${pid}`);

            childProcess.removeAllListeners();
            const promise = new Promise<void>(resolve => childProcess?.once('exit', () => {
                childProcess = null;
                resolve();
            }));

            childProcess.kill(flags.killSignal ?? config?.killSignal ?? 'SIGINT');

            await promise;
            logger?.debug(`Child process killed: ${pid}`);
        }

        async function createChildProcess(): Promise<void> {
            if (childProcess) await killChildProcess();
            if (throttle) {
                clearTimeout(throttle);
                throttle = null;
            }

            CLI.clearConsole();

            const exec: string[] = [...(config?.exec ?? []), ...(flags.exec ?? [])];

            if (exec.length > 0) {
                for (const script of exec) {
                    try {
                        logger?.log(`${kleur.cyan('$')} ${kleur.gray(script)}`);
                        CLI.run(script, {
                            cwd: cli.cwd,
                            stdio: 'inherit',
                            env: process.env
                        });

                        CLI.clearConsole();
                    } catch (error) {
                        logger?.error(error);
                        logger?.error(kleur.red(`Failed to execute script: ${kleur.gray(script)}`));
                        logger?.error(kleur.red(`Waiting for the next file changes...`));
                        return;
                    }
                }
            }

            if (flags.nostart) {
                logger?.log(kleur.green(`Waiting for the next file changes...`));
                return;
            }

            logger?.log(kleur.green(`Starting bot...`));
            logger?.debug(`Starting bot in development mode with flags: ${kleur.dim(processFlags.join(' '))}`);

            childProcess = fork(cli.binPath, processFlags, {
                cwd: cli.cwd,
                stdio: 'inherit',
                env: process.env
            });

            childProcess.on('exit', code => {
                const color = code === 0 ? kleur.green : kleur.red;

                logger?.log(color(`Process process exited with code: ${code}`));
                logger?.log(color(`Waiting for the next file changes...`));
            });
        }

        EventHandlers.addExitListener(async () => {
            await killChildProcess();
            process.exit(0);
        }, true);
    })
