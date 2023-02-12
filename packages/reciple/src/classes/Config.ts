import { RecipleConfigOptions, version } from '@reciple/client';
import { path, replaceAll } from 'fallout-utility';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { ClientOptions } from 'discord.js';
import yml from 'yaml';
import dotenv from 'dotenv';
import { cwd, flags } from '../utils/cli';

dotenv.config({
    path: flags.env ? path.resolve(flags.env) : path.join(cwd, '.env')
});

export interface IConfig extends RecipleConfigOptions {
    logger: {
        enabled: boolean;
        debugmode: boolean;
        coloredMessages: boolean;
        logToFile: {
            enabled: boolean;
            logsFolder: string;
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
            let configData = yml.parse(configYaml) as IConfig;

            if (configData.token === 'TOKEN') {
                configData.token = flags.token || await this.askToken() || 'TOKEN';
                configYaml = replaceAll(configYaml, 'token: TOKEN', `token: ${configData.token}`);
            }

            writeFileSync(this.configPath, configYaml, 'utf-8');
            this.config = configData;

            return this;
        }

        this.config = yml.parse(readFileSync(this.configPath, 'utf-8'));

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
        })).token;
    }

    public parseToken(): string|null {
        let token = flags.token || this.config?.token || null;
        if (!token) return token;

        const env = String(token).split(':');
        if (env.length !== 2 || env[0].toLowerCase() !== 'env') return token;

        return process.env[env[1]] ?? null;
    }

    public static defaultConfig(): IConfig {
        return yml.parse(this.defaultConfigYaml());
    }

    public static defaultConfigYaml(): string {
        if (!existsSync(this.defaultConfigPath)) throw new Error(`Default config file does not exists: ${this.defaultConfigPath}`);
        return readFileSync(this.defaultConfigPath, 'utf-8');
    }
}
