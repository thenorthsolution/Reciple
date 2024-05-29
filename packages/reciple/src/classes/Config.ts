import { Logger, RecipleClientConfig, RecipleError } from '@reciple/core';
import { recursiveDefaults, existsAsync } from '@reciple/utils';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { kleur } from 'fallout-utility/strings';
import { cliVersion } from '../utils/cli.js';
import { Awaitable } from 'discord.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

    public static async readDefaultConfig(): Promise<RecipleConfigJS> {
        return recursiveDefaults<RecipleConfigJS>(await import(this.defaultConfigFile))!;
    }

    public static async getDefaultConfigData(): Promise<string> {
        let defaultConfig = (await readFile(this.defaultConfigFile, 'utf-8')).replaceAll('\r\n', '\n');

        defaultConfig = defaultConfig.replace(`import { cliVersion } from 'reciple';\n`, '');
        defaultConfig = defaultConfig.replace('version: `^${cliVersion}`', 'version: `^'+ cliVersion +'`');

        return defaultConfig;
    }

    public static async readConfigJS(config: string|{ paths: string[]; default?: string; }, createIfNotExists?: true): Promise<RecipleConfigJS>;
    public static async readConfigJS(config: string|{ paths: string[]; default?: string; }, createIfNotExists?: false): Promise<RecipleConfigJS|null>;
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

        if (isFile) {
            const defaultConfig = await this.getDefaultConfigData();

            if (!await existsAsync(file)) {
                if (!createIfNotExists) return null;

                await mkdir(path.dirname(file), { recursive: true });
                await writeFile(file, defaultConfig);
            }
        }

        const data = recursiveDefaults<RecipleConfigJS>(await import(isFile ? ('file://' + file) : config));
        if (!data || !('config' in data)) throw new RecipleError(`Invalid config data in ${kleur.yellow("'" + file) + "'"}`);

        return data;
    }
}
