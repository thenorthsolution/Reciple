import { buildVersion, type Logger } from '@reciple/core';
import { existsAsync, PackageUpdateChecker, recursiveDefaults, type PackageUpdateCheckerOptions } from '@reciple/utils';
import type { Command, OptionValues } from 'commander';
import { type Awaitable, type PackageJson, isDebugging, kleur } from 'fallout-utility';
import { mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CLIDefaultFlags, ProcessInformation } from '../types/structures.js';
import { isMainThread, parentPort, threadId } from 'node:worker_threads';
import { cli } from '../types/constants.js';
import { config as loadEnv } from 'dotenv';
import { execSync, type ExecSyncOptions } from 'node:child_process';

export interface CLIOptions {
    packageJSON: PackageJson;
    processCwd?: string;
    commander: Command;
    binPath: string;
    logger?: Logger;
    updateChecker?: PackageUpdateCheckerOptions|PackageUpdateChecker;
}

export class CLI implements CLIOptions {
    public static root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../');
    public static commandsDir = path.join(CLI.root, './dist/commands');

    static get shardMode() {
        return !!process.env.SHARDS && !!process.env.SHARD_COUNT;
    }

    static get shardLogsFolder() {
        return CLI.shardMode ? process.env.SHARDS_LOGS_FOLDER : null;
    }

    static get shardDeployCommands() {
        return CLI.shardMode ? !!process.env.SHARDS_DEPLOY_COMMANDS : null;
    }

    static get threadId() {
        return (!isMainThread && parentPort !== undefined ? threadId : undefined) ?? null;
    }

    public packageJSON: PackageJson;
    public processCwd: string;
    public commander: Command;
    public binPath: string;
    public logger?: Logger;
    public logPath?: string;

    public updateChecker?: PackageUpdateChecker;

    get name() {
        return this.packageJSON.name ?? 'reciple';
    }

    get description() {
        return this.packageJSON.description ?? '';
    }

    get version() {
        return this.packageJSON.version!;
    }

    get args() {
        return this.commander.args;
    }

    get flags() {
        return this.commander.opts<CLIDefaultFlags>();
    }

    get cwd() {
        const cwd = this.getFlags().cwd;

        return cwd
            ? path.isAbsolute(cwd) ? cwd : path.join(this.processCwd, cwd)
            : this.processCwd;
    }

    get isCwdUpdated() {
        return process.cwd() !== this.processCwd;
    }

    get threadId() {
        return CLI.threadId;
    }

    get shardMode() {
        return CLI.shardMode;
    }

    get shardLogsFolder() {
        return CLI.shardLogsFolder;
    }

    get shardDeployCommands() {
        return CLI.shardDeployCommands;
    }

    get nodeEnv() {
        return process.env.NODE_ENV;
    }

    constructor(options: CLIOptions) {
        this.packageJSON = options.packageJSON;
        this.processCwd = options.processCwd ?? process.cwd();
        this.commander = options.commander;
        this.binPath = options.binPath;
        this.logger = options.logger;

        if (options.updateChecker) {
            this.updateChecker = options.updateChecker instanceof PackageUpdateChecker ? options.updateChecker : new PackageUpdateChecker(options.updateChecker);
        }

        this.commander
            .name(this.name)
            .description(this.description)
            .version(`reciple: ${this.version}\n@reciple/client: ${buildVersion}`, '-v, --version')
            .option('--env <file>', 'Set .env file path', (v, p) => p.concat(v), [path.join(this.cwd, '.env')])
            .option('--debug', 'Enable debug mode', isDebugging())
            .option('--production', 'Starts in production mode', false)
            .hook('preAction', (cmd, action) => this.preActionHandler(cmd, action))
            .allowUnknownOption(true);

        if (this.threadId === null) this.commander.option('--cwd <dir>', 'Set current working directory', this.processCwd)
    }

    public async parse(): Promise<this> {
        await this.registerSubcommands();

        if (!await existsAsync(this.cwd)) await mkdir(this.cwd, { recursive: true });

        const flags = this.getFlags();

        if (flags.debug && this.logger) {
            this.logger.debugmode ??= {};
            this.logger.debugmode.enabled ??= flags.debug;
            this.logger.debugmode.printMessage ??= true;
        }

        this.logger?.debug(`Reciple CLI flags:`, flags);

        if (flags.env.length) {
            this.logger?.debug(`Loading environment variables from:\n    ${kleur.cyan(flags.env.join('\n    '))}`);
            loadEnv({ path: flags.env });
        }

        this.updateChecker?.on('updateAvailable', data => this.logger?.warn(`An update is available for ${kleur.cyan(data.package)}: ${kleur.red(data.currentVersion)} ${kleur.gray('->')} ${kleur.green().bold(data.updatedVersion)}`));
        this.updateChecker?.on('updateError', (pkg, error) => this.logger?.debug(`An error occured while checking for updates for ${pkg}:`, error));
        this.updateChecker?.startCheckInterval(1000 * 60 * 60);

        await this.commander.parseAsync();

        return this;
    }

    public async registerSubcommands(dir: string = CLI.commandsDir): Promise<Command> {
        const statData = await stat(dir).catch(() => null);
        if (!statData) return this.commander;

        const files = (await readdir(dir))
            .map(f => path.join(dir, f))
            .filter(f => f.endsWith('.js'));

        for (const file of files) {
            const command = recursiveDefaults<(command: Command, cli: CLI) => Awaitable<void>>(await import(path.isAbsolute(file) ? `file://${file}` : file));
            if (!command || typeof command !== 'function') continue;

            await Promise.resolve(command(this.commander, this)).catch(() => null);
        }

        return this.commander;
    }

    public getFlags<Flags extends OptionValues = OptionValues>(command: Command|string, mergeDefault?: false): Flags|undefined;
    public getFlags<Flags extends OptionValues = OptionValues>(command: Command|string, mergeDefault: true): Flags & CLIDefaultFlags|undefined;
    public getFlags(command?: undefined): CLIDefaultFlags;
    public getFlags(command?: Command|string, mergeDefault: boolean = false): OptionValues|undefined {
        if (!command) return this.flags;

        command = typeof command === 'string' ? this.commander.commands.find(c => c.name() === command) : command;
        const flags = command?.opts();

        return mergeDefault ? { ...this.flags, ...flags } : flags;
    }

    public getCommand(name: string): Command|undefined;
    public getCommand(name?: undefined): Command;
    public getCommand(name?: string): Command|undefined {
        if (!name) return this.commander;

        return this.commander.commands.find(c => c.name() === name);
    }

    public async sendProcessInfo(): Promise<void> {
        const message: ProcessInformation = { type: 'ProcessInfo', pid: process.pid, threadId, log: cli.logPath };

        if (parentPort) parentPort.postMessage(message);
        if (process.send) process.send(message);
    }

    protected preActionHandler(command: Command, action: Command): void {
        this.logger?.debug(`Running command: ${kleur.cyan(command.name())} ${kleur.gray(kleur.bold(action.name()))}`);

        const flags = this.getFlags();

        if (flags.debug) process.env.NODE_ENV = 'development';
        if (flags.production) process.env.NODE_ENV = 'production';
        if ((cli.cwd !== cli.processCwd && !cli.isCwdUpdated) || this.threadId === null) process.chdir(cli.cwd);

        if (flags.debug && this.logger) {
            this.logger.debugmode = {
                ...this.logger?.debugmode,
                enabled: true
            }
        }
    }

    public static stringifyFlags(flags: OptionValues, command: Command, ignored: string[] = []): string[] {
        let arr: string[] = [];

        for (const [key, value] of Object.entries(flags)) {
            const option = command.options.find(o => o.name() === key || o.attributeName() === key);
            if (!option || ignored.includes(key)) continue;

            const flag = option.long ?? option.short ?? `--${option.name()}`;

            if (!option.flags.endsWith('>') && !option.flags.endsWith(']') && typeof value === 'boolean') {
                if (value) arr.push(flag);
                continue;
            }

            arr.push(flag, String(value));
        }

        return arr;
    }

    public static run(script: string, options?: ExecSyncOptions): string {
        return execSync(script, options).toString('utf-8');
    }

    public static clearConsole(): void {
        // process.stdout.write("\u001b[3J\u001b[2J\u001b[1J");
        // console.clear();
    }
}
