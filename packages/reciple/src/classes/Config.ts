import { getConfigExtensions } from '../utils/getConfigExtensions';
import { RecipleConfigOptions, version } from '@reciple/client';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { parseEnvString } from '../utils/parseEnvString';
import { replaceAll } from 'fallout-utility';
import { ClientOptions } from 'discord.js';
import { cli } from '../utils/cli';
import path from 'path';
import yml from 'yaml';

export interface IConfig extends RecipleConfigOptions {
    extends?: string|string[];
    logger: {
        enabled: boolean;
        debugmode: boolean;
        coloredMessages: boolean;
        logToFile: {
            enabled: boolean;
            logsFolder: string;
            file: string;
        };
    };
    modules: {
        modulesFolders: string[];
        exclude: string[];
        disableModuleVersionCheck: boolean;
    };
    client: ClientOptions;
    version: string;
}

export class Config {
    public static defaultConfigPath: string = path.join(__dirname, '../../static/config.yml');
    public config: IConfig|null = null;
    readonly configPath: string;

    constructor(configPath: string) {
        if (!configPath) throw new Error('Config path is not defined');
        this.configPath = configPath;
    }

    public async parseConfig(): Promise<this> {
        if (!existsSync(this.configPath)) {
            let configYaml = replaceAll(Config.defaultConfigYaml(), 'VERSION', version);
            const configData = yml.parse(configYaml) as IConfig;

            if (configData.token === 'TOKEN') {
                configData.token = cli.options.token || (await this.askToken()) || 'TOKEN';
                configYaml = replaceAll(configYaml, 'token: TOKEN', `token: ${configData.token}`);
            }

            writeFileSync(this.configPath, configYaml, 'utf-8');
            this.config = configData;
        } else {
            this.config = getConfigExtensions(yml.parse(readFileSync(this.configPath, 'utf-8')), this.configPath);
        }

        return this;
    }

    public getConfig(): IConfig {
        if (!this.config) throw new Error(`Config is not parsed`);
        this.config.token = this.parseToken() || 'TOKEN';

        return this.config;
    }

    public async askToken(): Promise<string> {
        return (await (await import('prompts')).default({
            name: 'token',
            type: 'password',
            mask: '*',
            message: 'Bot token:',
            validate: value => !value.length ? `Enter a valid bot token` : true
        }, { onCancel: () => process.exit(1) })).token;
    }

    public parseToken(): string|null {
        const token = cli.options.token || this.config?.token || null;
        if (!token) return token;

        return parseEnvString(token, cli.options.env ? path.resolve(cli.options.env) : path.join(cli.cwd, '.env')) || null;
    }

    public static defaultConfig(): IConfig {
        return yml.parse(this.defaultConfigYaml());
    }

    public static defaultConfigYaml(): string {
        if (!existsSync(this.defaultConfigPath)) throw new Error(`Default config file does not exists: ${this.defaultConfigPath}`);
        return readFileSync(this.defaultConfigPath, 'utf-8');
    }
}
