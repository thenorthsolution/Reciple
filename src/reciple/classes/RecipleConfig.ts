import { ClientOptions, PermissionFlags, PermissionString } from 'discord.js';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { isSupportedVersion, version } from '../version';
import { input, replaceAll } from 'fallout-utility';
import { token as __token } from '../flags';
import path from 'path';
import yaml from 'yaml';


export interface ConfigCommandPermissions {
    command: string;
    permissions: (PermissionFlags|PermissionString)[];
}

export interface Config {
    token: string;
    prefix: string;
    commands: {
        messageCommand: {
            enabled: boolean;
            replyOnError: boolean;
            allowCommandAlias: boolean;
            commandArgumentSeparator: string;
        }
        interactionCommand: {
            enabled: boolean;
            replyOnError: boolean;
            registerCommands: boolean;
            setRequiredPermissions: boolean;
            guilds: string[]|string;
        }
    }
    permissions: {
        messageCommands: {
            enabled: boolean;
            commands: ConfigCommandPermissions[];
        }
        interactionCommands: {
            enabled: boolean;
            commands: ConfigCommandPermissions[];
        }
    }
    ignoredChannels: {
        enabled: boolean;
        convertToAllowList: boolean;
        channels: string[];
    }
    fileLogging: {
        enabled: boolean;
        debugmode: boolean;
        clientLogs: boolean;
        stringifyLoggedJSON: boolean;
        logFilePath: string;
    }
    client: ClientOptions;
    messages: {
        [messageKey: string]: any;
    }
    ignoredFiles: string[];
    modulesFolder: string;
    version: string;
}

export class RecipleConfig {
    public config?: Config;
    public configPath: string = './reciple.yml';
    public static defaultConfigPath = path.join(__dirname, '../../../resource/reciple.yml');

    constructor(configPath: string) {
        if (!configPath) throw new Error('Config path is not defined');
        this.configPath = configPath;
    }

    /**
     * Parse the config file
     */
    public parseConfig(): RecipleConfig {
        if (!existsSync(this.configPath)) {
            const defaultConfigPath = RecipleConfig.defaultConfigPath;
            if (!existsSync(defaultConfigPath)) throw new Error('Default Config file not found. Please reinstall Reciple.');

            const defaultConfig = replaceAll(readFileSync(defaultConfigPath, 'utf-8'), 'VERSION', version);
            
            writeFileSync(this.configPath, defaultConfig, 'utf-8');
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

        if (!this.isSupportedConfig()) throw new Error('Unsupported config version. Your config version: '+ (this.config?.version || 'No version specified.') + ', Reciple version: '+ version);

        return this;
    }

    /**
     * Returns the parsed config file
     */
    public getConfig(): Config {
        if (!this.config) throw new Error('Config is not parsed.');

        this.config.token = this.parseToken() || 'TOKEN';
        return this.config;
    }

    /**
     * Parse token from config 
     */
    public parseToken(askIfNull: boolean = true): string|null {
        let token = __token || null;

        if (!this.config && !token) return token;
        if (this.config && !this.config?.token && !token) return token || (askIfNull ? this.askToken() : null);
        
        token = token || this.config?.token || null;
        if (!token) return token;

        const envToken = token.toString().split(':');
        if (envToken.length === 2 && envToken[0].toLocaleLowerCase() === 'env' && envToken[1]) {
            token = process.env[envToken[1]] || null;
        }

        return token || (askIfNull ? this.askToken() : null);
    }

    /**
     * Check if the config version is supported
     */
    private isSupportedConfig(): boolean {
        return isSupportedVersion(this.config?.version || '0.0.0', version);
    }

    /**
     * Ask for a token
     */
    private askToken(): string|null {
        return __token || input({ 'text': 'Bot Token >>> ', echo: '*', repeatIfEmpty: true, exitStrings: ['exit', 'quit', ''], sigint: true }) || null;
    }

    /**
     * Get default config
     */
    public static getDefaultConfig(): Config {
        if (existsSync(this.defaultConfigPath)) throw new Error("Default config file does not exists.");

        return yaml.parse(readFileSync(this.defaultConfigPath, 'utf-8'));
    }
}
