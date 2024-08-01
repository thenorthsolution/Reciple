import { buildVersion, type Logger } from '@reciple/core';
import { existsAsync, recursiveDefaults } from '@reciple/utils';
import type { Command, OptionValues } from 'commander';
import type { Awaitable, PackageJson } from 'fallout-utility';
import { mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CLIDefaultFlags } from '../types/structures.js';
import { isMainThread, parentPort, threadId } from 'node:worker_threads';
import { cli } from '../types/constants.js';
import { config as loadEnv } from 'dotenv';

export interface CLIOptions {
    packageJSON: PackageJson;
    processCwd?: string;
    commander: Command;
    binPath: string;
    logger?: Logger;
}

export class CLI implements CLIOptions {
    public static root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../');
    public static commandsDir = path.join(CLI.root, './dist/commands');

    public packageJSON: PackageJson;
    public processCwd: string;
    public commander: Command;
    public binPath: string;
    public logger?: Logger;

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

    get threadId() {
        return (!isMainThread && parentPort !== undefined ? threadId : undefined) ?? null;
    }

    get isCwdUpdated() {
        return process.cwd() !== this.processCwd;
    }

    constructor(options: CLIOptions) {
        this.packageJSON = options.packageJSON;
        this.processCwd = options.processCwd ?? process.cwd();
        this.commander = options.commander;
        this.binPath = options.binPath;

        this.commander
            .name(this.name)
            .description(this.description)
            .version(`reciple: ${this.version}\n@reciple/client: ${buildVersion}`, '-v, --version')
            .option('--env <file>', 'Set .env file path', (v, p) => p.concat(v), [path.join(this.cwd, '.env')])
            .option('--debug', 'Enable debug mode', false)
            .allowUnknownOption(true);

        if (this.threadId === null) this.commander.option('--cwd <dir>', 'Set current working directory', this.processCwd)
    }

    public async parse(): Promise<this> {
        await this.registerSubcommands();
        await this.commander.parseAsync();

        if (!await existsAsync(this.cwd)) await mkdir(this.cwd, { recursive: true });
        if ((cli.cwd !== cli.processCwd && !cli.isCwdUpdated) || this.threadId === null) process.chdir(cli.cwd);

        const flags = this.getFlags();

        if (flags.debug && this.logger) {
            this.logger.debugmode ??= {};
            this.logger.debugmode.enabled ??= flags.debug;
            this.logger.debugmode.printMessage ??= true;
        }

        if (flags.env.length) {
            loadEnv({ path: flags.env });
        }

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

    public static addExitListener(listener: (signal: NodeJS.Signals) => any, once?: boolean): void {
        if (!once) {
            process.on('SIGHUP', listener);
            process.on('SIGINT', listener);
            process.on('SIGQUIT', listener);
            process.on('SIGABRT', listener);
            process.on('SIGALRM', listener);
            process.on('SIGTERM', listener);
            process.on('SIGBREAK', listener);
            process.on('SIGUSR2', listener);
        } else {
            process.once('SIGHUP', listener);
            process.once('SIGINT', listener);
            process.once('SIGQUIT', listener);
            process.once('SIGABRT', listener);
            process.once('SIGALRM', listener);
            process.once('SIGTERM', listener);
            process.once('SIGBREAK', listener);
            process.once('SIGUSR2', listener);
        }
    }

    public static removeExitListener(listener: (signal: NodeJS.Signals) => any): void {
        process.removeListener('SIGHUP', listener);
        process.removeListener('SIGINT', listener);
        process.removeListener('SIGQUIT', listener);
        process.removeListener('SIGABRT', listener);
        process.removeListener('SIGALRM', listener);
        process.removeListener('SIGTERM', listener);
        process.removeListener('SIGBREAK', listener);
        process.removeListener('SIGUSR2', listener);
    }
}
