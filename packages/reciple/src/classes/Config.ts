import { RecipleClientOptions, RecipleError, version } from '@reciple/core';
import { recursiveDefaults, getDirModuleType } from '@reciple/utils';
import { kleur } from 'fallout-utility';
import { existsSync } from 'fs';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

export interface RecipleConfig extends RecipleClientOptions {
    logger: {
        enabled: boolean;
        debugmode?: boolean|null;
        coloredMessages: boolean;
        disableLogPrefix: boolean;
        logToFile: {
            enabled: boolean;
            logsFolder: string;
            file: string;
        };
    };
    modules: {
        dirs: string[];
        exclude: string[];
        disableModuleVersionCheck: boolean;
    };
    checkForUpdates: boolean;
    version: string;
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
        let defaultConfig = await readFile(this.defaultConfigFile, 'utf-8');

        defaultConfig = defaultConfig.replace(`import { version } from '@reciple/core';\n`, '');
        defaultConfig = defaultConfig.replace('version: `^${version}`', 'version: `^'+ version +'`');

        if (useCommonJS) {
            defaultConfig = defaultConfig.replace(`import { IntentsBitField } from 'discord.js';`, `const { IntentsBitField } = require('discord.js');`);
            defaultConfig = defaultConfig.replace(`export const config`, `const config`);
            defaultConfig += `\nmodule.exports = { config };\n`;
        }

        return defaultConfig;
    }

    public static async readConfigJS(config: string): Promise<RecipleConfigJS> {
        const file = (config.startsWith('.') || config.startsWith('/') ? path.resolve(config) : config);
        const isAbsolute = config !== file || path.isAbsolute(config);

        if (isAbsolute && !existsSync(file)) {
            const isCommonJS = file.endsWith('.cjs') || ((await getDirModuleType(path.dirname(file))) === 'commonjs');
            const defaultConfig = await this.getDefaultConfigData(!file.endsWith('.mjs') && isCommonJS);

            await mkdir(path.dirname(file), { recursive: true });
            await writeFile(file, defaultConfig);
        }

        const data = recursiveDefaults<RecipleConfigJS>(await import(isAbsolute ? ('file://' + file) : file));
        if (!data || !('config' in data)) throw new RecipleError(`Invalid config data in ${kleur.yellow("'" + file) + "'"}`);

        return data;
    }
}
