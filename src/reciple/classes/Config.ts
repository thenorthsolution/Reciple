import { input, replaceAll } from 'fallout-utility';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { token as __token, configDir as __configDir } from '../flags';
import { ClientOptions, MessageOptions } from 'discord.js';
import path from 'path';
import yaml from 'yaml';

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
            guilds: string[];
        }
    }
    permissions: {
        messageCommand: {
            enabled: boolean;
            commands: {
                command: string;
                permissions: string[];
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
}

export class RecipleConfig {
    public config?: Config;
    public configPath: string = './reciple.yml';

    constructor(configPath: string) {
        if (__configDir) configPath = path.resolve(__configDir);
        if (!configPath) throw new Error('Config path is not defined');
        this.configPath = configPath;
    }

    public parseConfig(): RecipleConfig {
        if (!existsSync(this.configPath)) {
            const defaultConfigPath = path.resolve(__dirname, '../../../resource/reciple.yml');
            if (!existsSync(defaultConfigPath)) throw new Error('Default Config file not found. Please reinstall Reciple.');

            const defaultConfig = readFileSync(defaultConfigPath, 'utf-8');
            
            writeFileSync(this.configPath, defaultConfig, 'utf-8');
            if (!existsSync(this.configPath)) throw new Error('Failed to create config file.');
            
            this.config = yaml.parse(defaultConfig);
            if (this.config && this.config.token === 'TOKEN') {
                this.config.token = this.askToken() || this.config.token;
                writeFileSync(this.configPath, replaceAll(yaml.stringify(this.config), 'TOKEN', this.config.token), 'utf-8');
            }

            return this;
        }

        const config = readFileSync(this.configPath, 'utf-8');
        if (!config) throw new Error('Failed to read config file.');
        
        this.config = yaml.parse(config);

        return this;
    }

    public getConfig(): Config {
        if (!this.config) throw new Error('Config is not parsed.');
        return this.config;
    }

    public parseToken(askIfNull: boolean = true): string|null {
        let token = __token || null;

        if (token) return token;
        if (!this.config) return token;
        if (!this.config.token) return token;
        
        const envToken = this.config.token.toString().split(':');
        if (envToken.length === 2 && envToken[0].toLocaleLowerCase() === 'env' && envToken[1]) {
            token = process.env[envToken[1]] || null;
        } else {
            token = this.config.token;
        }

        return token || (askIfNull ? this.askToken() : null);
    }

    private askToken(): string|null {
        return __token || input({ 'text': 'Bot Token >>> ', echo: '*', repeatIfEmpty: true, exitStrings: ['exit', 'quit', ''], sigint: true }) || null;
    }
}