import { input, replaceAll } from 'fallout-utility';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { token as __token } from '../flags';
import { ClientOptions, MessageOptions, PermissionResolvable } from 'discord.js';
import path from 'path';
import yaml from 'yaml';
import { version } from '../version';

export interface Config {
    token: string;
    prefix: string;
    commands: {
        messageCommand: {
            enabled: boolean;
            commandArgumentSeparator: string;
        }
        interactionCommand: {
            enabled: boolean;
            registerCommands: boolean;
            guilds: string[]|string;
        }
    }
    permissions: {
        messageCommands: {
            enabled: boolean;
            commands: {
                command: string;
                permissions: PermissionResolvable[];
            }[];
        }
        interactionCommands: {
            enabled: boolean;
            commands: {
                command: string;
                permissions: PermissionResolvable[];
            }[];
        }
    }
    ignoredChannels: {
        enabled: boolean;
        convertToAllowList: boolean;
        channels: string[];
    }
    fileLogging: {
        enabled: boolean;
        logFilePath: string;
    }
    client: ClientOptions;
    messages: {
        [key: string]: MessageOptions|string;
    }
    modulesFolder: string;
    version?: string;
}

export class RecipleConfig {
    public config?: Config;
    public configPath: string = './reciple.yml';

    constructor(configPath: string) {
        if (!configPath) throw new Error('Config path is not defined');
        this.configPath = configPath;
    }

    public parseConfig(): RecipleConfig {
        if (!existsSync(this.configPath)) {
            const defaultConfigPath = path.join(__dirname, '../../../resource/reciple.yml');
            if (!existsSync(defaultConfigPath)) throw new Error('Default Config file not found. Please reinstall Reciple.');

            const defaultConfig = readFileSync(defaultConfigPath, 'utf-8');
            
            writeFileSync(this.configPath, replaceAll(defaultConfig, 'VERSION', version), 'utf-8');
            if (!existsSync(this.configPath)) throw new Error('Failed to create config file.');
            
            this.config = yaml.parse(defaultConfig);
            if (this.config && this.config.token === 'TOKEN') {
                this.config.token = this.askToken() || this.config.token;
                writeFileSync(this.configPath, replaceAll(defaultConfig, 'TOKEN', this.config.token), 'utf-8');
            }

            return this;
        }

        if (!existsSync(this.configPath)) throw new Error('Failed to read config file.');
        const config = readFileSync(this.configPath, 'utf-8');
        
        this.config = yaml.parse(config);

        if (!this.isSupportedConfig()) throw new Error('Unsupported config version. Your config version: '+ (this.config || 'No version specified.') + ', Reciple version: '+ version);

        return this;
    }

    public getConfig(): Config {
        if (!this.config) throw new Error('Config is not parsed.');

        this.config.token = this.parseToken() || 'TOKEN';
        return this.config;
    }

    public parseToken(askIfNull: boolean = true): string|null {
        let token = __token || null;

        if (token) return token;
        if (!this.config) return token;
        if (!this.config.token) return token || (askIfNull ? this.askToken() : null);
        
        const envToken = this.config.token.toString().split(':');
        if (envToken.length === 2 && envToken[0].toLocaleLowerCase() === 'env' && envToken[1]) {
            token = process.env[envToken[1]] || null;
        } else {
            token = this.config.token;
        }

        return token || (askIfNull ? this.askToken() : null);
    }

    private isSupportedConfig(): boolean {
        return (this.config?.version && this.config.version != version) ? false : true;
    }

    private askToken(): string|null {
        return __token || input({ 'text': 'Bot Token >>> ', echo: '*', repeatIfEmpty: true, exitStrings: ['exit', 'quit', ''], sigint: true }) || null;
    }
}