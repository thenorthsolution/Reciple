import { RecipleConfigOptions, RecipleError, version } from '@reciple/client';
import { ClientOptions, RestOrArray, normalizeArray } from 'discord.js';
import { getConfigExtensions } from '../utils/getConfigExtensions';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { parseEnvString } from '../utils/parseEnvString';
import { replaceAll, kleur } from 'fallout-utility';
import { existsSync, readFileSync } from 'node:fs';
import { cli } from '../utils/cli';
import path from 'node:path';
import dotenv from 'dotenv';
import yml from 'yaml';

export interface IConfig extends RecipleConfigOptions {
    extends?: string|string[];
    logger: {
        enabled: boolean;
        debugmode: boolean;
        coloredMessages: boolean;
        disableLogPrefix: boolean;
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
    checkForUpdates: boolean;
    version: string;
}

export class Config {
    public static defaultConfigPath: string = path.join(__dirname, '../../static/config.yml');
    public config: IConfig|null = null;

    readonly configPath: string;
    readonly extensionPaths: string[] = [];

    constructor(configPath: string, extensionPaths?: string[]) {
        if (!configPath) throw new RecipleError({ message: 'Config path is not defined', name: 'InvalidConfigPath' });
        this.configPath = configPath;
        this.extensionPaths = extensionPaths ?? [];
    }

    public async parseConfig(): Promise<this> {
        if (!existsSync(this.configPath)) {
            let configYaml = replaceAll(Config.defaultConfigYaml(), 'VERSION', version);
            const configData = yml.parse(configYaml) as IConfig;

            if (configData.token === 'TOKEN') {
                configData.token = cli.options.token || (await this.askToken()) || 'TOKEN';
                configYaml = replaceAll(configYaml, 'token: TOKEN', `token: ${configData.token}`);
            }

            await mkdir(path.dirname(this.configPath), { recursive: true });
            await writeFile(this.configPath, configYaml, 'utf-8');
            this.config = configData;
        } else {
            this.config = yml.parse(await readFile(this.configPath, 'utf-8'));
        }

        this.config!.extends = normalizeArray([this.config?.extends ?? []] as RestOrArray<string>);
        this.config!.extends.push(...this.extensionPaths);

        this.config = getConfigExtensions(this.config!, this.configPath);

        return this;
    }

    public getConfig(): IConfig {
        if (!this.config) throw new RecipleError({ message: 'Config is not parsed', name: 'InvalidParsedConfigData' });
        this.config.token = this.parseToken() || 'TOKEN';

        return Config.resolveEnvValues(this.config);
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

        return parseEnvString(token, cli.options.env ? path.resolve(cli.options.env) : path.join(process.cwd(), '.env')) || null;
    }

    public static resolveEnvValues<T extends Record<any, any>|string|Array<any>>(object: T, envFile?: string): T {
        if (envFile) dotenv.config({ path: envFile, override: true });
        if (typeof object !== 'object') return (typeof object === 'string' ? parseEnvString(object) : object) as T;
        if (Array.isArray(object)) return object.map(v => parseEnvString(v)) as T;

        const keys = object ? Object.keys(object) : [];
        const values = Object.values(object!);

        let newObject = {};
        let i = 0;

        for (const value of values) {
            newObject = {
                ...newObject,
                [keys[i]]: typeof value === 'string' || typeof value === 'object'
                    ? this.resolveEnvValues(value)
                    : value
            };

            i++;
        }

        return newObject as T;
    }

    public static defaultConfig(): IConfig {
        return yml.parse(this.defaultConfigYaml());
    }

    public static defaultConfigYaml(): string {
        if (!existsSync(this.defaultConfigPath)) throw new RecipleError(`Default config file does not exists '${kleur.yellow(this.defaultConfigPath)}'`);
        return readFileSync(this.defaultConfigPath, 'utf-8');
    }
}
