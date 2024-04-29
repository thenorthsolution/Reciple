import { Logger, RecipleClientConfig, RecipleError } from '@reciple/core';
import { recursiveDefaults, getDirModuleType, existsAsync } from '@reciple/utils';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { kleur } from 'fallout-utility/strings';
import { cliVersion } from '../utils/cli';
import { Awaitable } from 'discord.js';
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
    watch?: {
        include?: string[];
        ignore?: string|RegExp|((text: string) => boolean)|(string|RegExp|((text: string) => boolean))[];
        reloadTriggerEvent?: 'all'|'add'|'addDir'|'change'|'unlink'|'unlinkDir';
        preLoadScript?: string;
    };
    checkForUpdates?: boolean;
    version?: string;
}

export interface RecipleConfigJS {
    config: RecipleConfig;
}

export class ConfigReader {
    public static defaultConfigFile = path.join(__dirname, '../../static/config.mjs');

    public static async readDefaultConfig(): Promise<RecipleConfigJS> {
        return recursiveDefaults<RecipleConfigJS>(await import(this.defaultConfigFile))!;
    }

    public static async getDefaultConfigData(useCommonJS?: boolean): Promise<string> {
        let defaultConfig = (await readFile(this.defaultConfigFile, 'utf-8')).replaceAll('\r\n', '\n');

        defaultConfig = defaultConfig.replace(`import { cliVersion } from 'reciple';\n`, '');
        defaultConfig = defaultConfig.replace('version: `^${cliVersion}`', 'version: `^'+ cliVersion +'`');

        if (useCommonJS) {
            defaultConfig = defaultConfig.replace(`import { CooldownPrecondition, CommandPermissionsPrecondition } from 'reciple';`, `const { CooldownPrecondition, CommandPermissionsPrecondition } = require('reciple');`);
            defaultConfig = defaultConfig.replace(`import { IntentsBitField } from 'discord.js';`, `const { IntentsBitField } = require('discord.js');`);
            defaultConfig = defaultConfig.replace(`export const config`, `const config`);
            defaultConfig += `\nmodule.exports = { config };\n`;
        }

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
        const isFile = path.isAbsolute(config) || await existsAsync(file) || ['reciple.js', 'reciple.mjs', 'reciple.cjs'].includes(config);

        if (isFile) {
            const isCommonJS = file.endsWith('.cjs') || ((await getDirModuleType(path.dirname(file))) === 'commonjs');
            const defaultConfig = await this.getDefaultConfigData(!file.endsWith('.mjs') && isCommonJS);

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
