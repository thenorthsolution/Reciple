import path from 'node:path';
import type { RecipleConfig } from '../types/structures.js';
import { CLI } from './CLI.js';
import { existsAsync, recursiveDefaults } from '@reciple/utils';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { cliVersion } from '../types/constants.js';
import { FileWriteStreamMode, Logger, RecipleError, type LoggerOptions } from '@reciple/core';
import { kleur } from 'fallout-utility';
import type { ShardingManagerOptions } from 'discord.js';

export interface RecipleConfigJS {
    config: RecipleConfig;
    sharding?: Omit<ShardingManagerOptions, 'shardArgs'|'token'|'execArgv'>;
}

export interface ConfigReadOptions {
    path: string;
    createIfNotExists?: boolean;
}

export class Config {
    private constructor() {}

    public static defaultConfigFile = path.join(CLI.root, './static/config.mjs');

    public static async getDefaultConfigData(): Promise<RecipleConfigJS> {
        return recursiveDefaults<RecipleConfigJS>(await import(Config.defaultConfigFile))!;
    }

    public static async getDefaultConfigContent(): Promise<string> {
        let defaultConfig = (await readFile(Config.defaultConfigFile, 'utf-8')).replaceAll('\r\n', '\n');

        defaultConfig = defaultConfig.replace(`import { cliVersion } from 'reciple';\n`, '');
        defaultConfig = defaultConfig.replace('version: `^${cliVersion}`', 'version: `^'+ cliVersion +'`');

        return defaultConfig;
    }

    public static async readConfigFile(options: ConfigReadOptions & { createIfNotExists: false }): Promise<RecipleConfigJS|null>;
    public static async readConfigFile(options: ConfigReadOptions & { createIfNotExists?: true }): Promise<RecipleConfigJS>;
    public static async readConfigFile(options: ConfigReadOptions): Promise<RecipleConfigJS|null> {
        const file = path.resolve(options.path);
        const isFile = path.isAbsolute(options.path) || await existsAsync(file) || ['reciple.js', 'reciple.mjs'].includes(options.path);

        if (isFile && !await existsAsync(file)) {
            if (!options.createIfNotExists) return null;
            await Config.createConfigFile(file);
        }

        const data = recursiveDefaults<RecipleConfigJS>(await import(isFile ? ('file://' + file) : options.path));
        if (!data || !('config' in data)) throw new RecipleError(`Invalid config data in ${kleur.yellow("'" + file) + "'"}`);

        return data;
    }

    public static async createConfigFile(file: string): Promise<string> {
        if (await existsAsync(file)) return file;

        const defaultConfig = await Config.getDefaultConfigContent();

        await mkdir(path.dirname(file), { recursive: true });
        await writeFile(file, defaultConfig, 'utf-8');

        return file;
    }

    public static async createLoggerOptions(config: RecipleConfig, options?: Partial<LoggerOptions>, cli?: CLI): Promise<LoggerOptions> {
        const loggerConfig: Exclude<RecipleConfig['logger'], Logger> = !(config.logger instanceof Logger) ? config.logger : undefined;

        let file: string|undefined = loggerConfig?.logToFile.enabled && loggerConfig?.logToFile.logsFolder && loggerConfig?.logToFile.file
            ? path.join(loggerConfig?.logToFile.logsFolder, loggerConfig?.logToFile.file)
            : undefined;

        if (CLI.shardMode && loggerConfig?.logToFile.enabled) {
            const folder = CLI.shardLogsFolder ??loggerConfig?.logToFile.logsFolder;

            file = path.join(folder, `${(process.env.SHARDS ? process.env.SHARDS + '-' : '') + (CLI.threadId !== null ? (CLI.threadId + '-') : '') + process.pid}.log`);
        }

        if (cli && file) cli.logPath = file;

        const data: LoggerOptions =  {
            ...options,
            debugmode: {
                ...options?.debugmode,
                enabled: options?.debugmode?.enabled ?? (
                    typeof loggerConfig?.debugmode === 'boolean'
                        ? loggerConfig?.debugmode
                        : undefined
                )
            },
            writeStream: loggerConfig?.logToFile.enabled && file
                ? await Logger.createFileWriteStream({
                    mode: FileWriteStreamMode.Rename,
                    path: file
                })
                : undefined,
            label: (cli?.shardMode ? `Shards ${process.env.SHARDS ?? CLI.threadId}` : null) || options?.label
        };

        logger.debug(`Created logger options:`, data);

        return data;
    }
}
