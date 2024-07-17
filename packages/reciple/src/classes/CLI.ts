import { buildVersion } from '@reciple/core';
import { resolveEnvProtocol } from '@reciple/utils';
import { Command } from 'commander';
import type { PackageJson } from 'fallout-utility';
import path from 'path';
import { isMainThread, parentPort, threadId } from 'worker_threads';
import type { ProcessInformation } from '../exports.js';

export interface CLIOptions {
    packageJSON: PackageJson;
    binPath: string;
    logPath?: string;
    cwd?: string;
}

export interface CLIFlags {
    version?: string;
    token?: string;
    config?: string;
    debugmode?: boolean;
    yes?: boolean;
    env?: string;
    shardmode?: boolean;
    setup?: boolean;
    [k: string]: any;
}

export class CLI {
    public packageJSON: PackageJson;
    public processCwd: string;
    public commander: Command;
    public binPath: string;
    public logPath?: string;

    get name() {
        return this.packageJSON.name!;
    }

    get description() {
        return this.packageJSON.description!;
    }

    get version() {
        return this.packageJSON.version!;
    }

    get args() {
        return this.commander.args;
    }

    get flags() {
        return this.commander.opts<CLIFlags>();
    }

    /**
     * @deprecated Use `.flags` instead
     */
    get options() {
        return this.flags;
    }

    get cwd() {
        return this.args[0]
            ? path.isAbsolute(this.args[0]) ? this.args[0] : path.join(this.processCwd, this.args[0])
            : process.cwd();
    }

    get shardmode() {
        return !!(this.options.shardmode ?? process.env.SHARDMODE);
    }

    get threadId() {
        return !isMainThread && parentPort !== undefined ? threadId : undefined;
    }

    get isCwdUpdated() {
        return process.cwd() !== this.processCwd;
    }

    /**
     * @deprecated Use `.processCwd` instead
     */
    get nodeCwd() {
        return this.processCwd;
    }

    get token() {
        return (this.flags.token && resolveEnvProtocol(this.flags.token)) || null;
    }

    constructor(options: CLIOptions) {
        this.packageJSON = options.packageJSON;
        this.processCwd = options.cwd ?? process.cwd();
        this.commander = new Command();
        this.binPath = options.binPath;
        this.logPath = options.logPath;

        this.commander
            .name(this.name)
            .description(this.description)
            .version(`reciple: ${this.version}\n@reciple/client: ${buildVersion}`, '-v, --version')
            .argument('[cwd]', 'Change the current working directory')
            .option('-t, --token <token>', 'Replace used bot token')
            .option('-c, --config <dir>', 'Set path to a config file')
            .option('-D, --debugmode', 'Enable debug mode')
            .option('-y, --yes', 'Agree to all Reciple confirmation prompts')
            .option('--env <file>', '.env file location')
            .option('--shardmode', 'Modifies some functionalities to support sharding')
            .option('--setup', 'Create required config without starting the bot')
            .allowUnknownOption(true);
    }

    public async parse(): Promise<this> {
        await this.commander.parseAsync();

        return this;
    }

    public async sendShardProcessInfo(): Promise<void> {
        const message: ProcessInformation = { type: 'ProcessInfo', pid: process.pid, threadId, log: cli.logPath };

        if (parentPort) parentPort.postMessage(message);
        if (process.send) process.send(message);
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
