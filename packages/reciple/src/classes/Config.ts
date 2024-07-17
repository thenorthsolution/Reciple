import { Logger, type RecipleClientConfig, RecipleError } from '@reciple/core';
import { recursiveDefaults, existsAsync } from '@reciple/utils';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { kleur } from 'fallout-utility/strings';
import { cliVersion } from '../utils/cli.js';
import { fileURLToPath } from 'node:url';
import type { Awaitable } from 'discord.js';
import path from 'node:path';

export interface RecipleConfig extends RecipleClientConfig {
    logger?: {
        enabled: boolean;
        debugmode?: boolean|null;
        coloredMessages: boolean;
        disableLogPrefix: boolean;
        logToFile: {
            enabled: boolean;
            logsFolder: string;
            file: string;
        };
    }|Logger;
    modules?: {
        dirs: string[];
        exclude?: string[];
        filter?: (file: string) => Awaitable<boolean>;
        disableModuleVersionCheck?: boolean;
    };
    checkForUpdates?: boolean;
    version?: string;
}

export interface RecipleConfigJS {
    config: RecipleConfig;
}

export class ConfigReader {
    public static defaultConfigFile = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../static/config.mjs');

    /**
     * Reads the default configuration data, processes it, and returns the resulting configuration string.
     *
     * @return {Promise<string>} The default configuration data as a string.
     */
    public static async readDefaultConfig(): Promise<RecipleConfigJS> {
        return recursiveDefaults<RecipleConfigJS>(await import(this.defaultConfigFile))!;
    }

    /**
     * Reads the default configuration data, processes it, and returns the resulting configuration string.
     *
     * @return {Promise<string>} The default configuration data as a string.
     */
    public static async getDefaultConfigData(): Promise<string> {
        let defaultConfig = (await readFile(this.defaultConfigFile, 'utf-8')).replaceAll('\r\n', '\n');

        defaultConfig = defaultConfig.replace(`import { cliVersion } from 'reciple';\n`, '');
        defaultConfig = defaultConfig.replace('version: `^${cliVersion}`', 'version: `^'+ cliVersion +'`');

        return defaultConfig;
    }

    public static async readConfigJS(config: string|{ paths: string[]; default?: string; }, createIfNotExists?: true): Promise<RecipleConfigJS>;
    public static async readConfigJS(config: string|{ paths: string[]; default?: string; }, createIfNotExists?: false): Promise<RecipleConfigJS|null>;
    /**
     * Reads a JavaScript configuration file and returns its contents as a `RecipleConfigJS` object.
     * If the file does not exist, it can optionally create the file and return a default configuration.
     *
     * @param {string|{ paths: string[]; default?: string; }} config - The path to the configuration file or an object specifying multiple paths and a default path.
     * @param {boolean} [createIfNotExists=true] - Whether to create the configuration file if it does not exist.
     * @return {Promise<RecipleConfigJS|null>} A promise that resolves to the contents of the configuration file as a `RecipleConfigJS` object, or `null` if the file does not exist and `createIfNotExists` is `false`.
     * @throws {RecipleError} If the configuration file does not contain valid data.
     */
    public static async readConfigJS(config: string|{ paths: string[]; default?: string; }, createIfNotExists: boolean = true): Promise<RecipleConfigJS|null> {
        if (typeof config !== 'string') {
            let data: RecipleConfigJS|null = null;

            for (const file of config.paths) {
                data = await this.readConfigJS(file, false);

                if (data) break;
            }

            return data ?? this.readConfigJS(config.default ?? config.paths[0], createIfNotExists as true);
        }

        const file = path.resolve(config);
        const isFile = path.isAbsolute(config) || await existsAsync(file) || ['reciple.js', 'reciple.mjs'].includes(config);

        if (isFile && !await existsAsync(file)) {
            if (!createIfNotExists) return null;
            await this.createConfigJS(file);
        }

        const data = recursiveDefaults<RecipleConfigJS>(await import(isFile ? ('file://' + file) : config));
        if (!data || !('config' in data)) throw new RecipleError(`Invalid config data in ${kleur.yellow("'" + file) + "'"}`);

        return data;
    }

    /**
     * Creates a configuration file if it doesn't exist and returns the file path.
     *
     * @param {string} file - The path to the configuration file.
     * @return {Promise<string>} The path of the created or existing configuration file.
     */
    public static async createConfigJS(file: string): Promise<string> {
        if (await existsAsync(file)) return file;

        const defaultConfig = await this.getDefaultConfigData();

        await mkdir(path.dirname(file), { recursive: true });
        await writeFile(file, defaultConfig);

        return file;
    }

    public static resolveConfigPaths(configPath: string): string[] {
        let configPaths = [path.resolve('./reciple.mjs'), path.resolve('./reciple.js')];

        const isCustomPath = !configPaths.includes(configPath) || !!cli.flags.config;

        if (!isCustomPath) {
            configPaths = configPaths.filter(p => p !== configPath);
            configPaths.unshift(configPath);
        } else {
            configPaths = [configPath];
        }

        return configPaths;
    }
}
