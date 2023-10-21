import { RecipleClientConfig, RecipleError, version } from '@reciple/core';
import { recursiveDefaults, getDirModuleType } from '@reciple/utils';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { kleur } from 'fallout-utility/strings';
import { existsSync } from 'node:fs';
import path from 'node:path';

export interface RecipleConfig extends RecipleClientConfig {
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
            defaultConfig = defaultConfig.replace(`import { CooldownPrecondition, CommandPermissionsPrecondition } from 'reciple';`, `const { CooldownPrecondition, CommandPermissionsPrecondition } = require('reciple');`);
            defaultConfig = defaultConfig.replace(`import { IntentsBitField } from 'discord.js';`, `const { IntentsBitField } = require('discord.js');`);
            defaultConfig = defaultConfig.replace(`export const config`, `const config`);
            defaultConfig += `\nmodule.exports = { config };\n`;
        }

        return defaultConfig;
    }

    public static async readConfigJS(config: string): Promise<RecipleConfigJS> {
        const file = path.resolve(config);
        const isFile = path.isAbsolute(config) || existsSync(file) || ['reciple.js', 'reciple.mjs', 'reciple.cjs'].includes(config);

        if (isFile) {
            const isCommonJS = file.endsWith('.cjs') || ((await getDirModuleType(path.dirname(file))) === 'commonjs');
            const defaultConfig = await this.getDefaultConfigData(!file.endsWith('.mjs') && isCommonJS);

            if (!existsSync(file)) {
                await mkdir(path.dirname(file), { recursive: true });
                await writeFile(file, defaultConfig);
            }
        }

        const data = recursiveDefaults<RecipleConfigJS>(await import(isFile ? ('file://' + file) : config));
        if (!data || !('config' in data)) throw new RecipleError(`Invalid config data in ${kleur.yellow("'" + file) + "'"}`);

        return data;
    }
}
