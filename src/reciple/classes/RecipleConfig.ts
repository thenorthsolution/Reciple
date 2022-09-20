import { ClientOptions, PermissionResolvable } from 'discord.js';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { isSupportedVersion, version } from '../version';
import { input, replaceAll } from 'fallout-utility';
import { cwd, token as __token } from '../flags';
import path from 'path';
import yaml from 'yaml';

/**
 * Command permissions config object interface
 */
export interface ConfigCommandPermissions {
    command: string;
    permissions: PermissionResolvable[];
}

/**
 * Reciple config object interface
 */
export interface Config {
    token: string;
    commands: {
        slashCommand: {
            enabled: boolean;
            replyOnError: boolean;
            registerCommands: boolean;
            enableCooldown: boolean;
            setRequiredPermissions: boolean;
            acceptRepliedInteractions: boolean;
            guilds?: string[]|string;
            permissions: {
                enabled: boolean;
                commands: ConfigCommandPermissions[];
            }
        }
        messageCommand: {
            enabled: boolean;
            prefix?: string;
            replyOnError: boolean;
            allowCommandAlias: boolean;
            enableCooldown: boolean;
            commandArgumentSeparator: string;
            permissions: {
                enabled: boolean;
                commands: ConfigCommandPermissions[];
            }
        }
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
    modulesFolder: string|string[];
    disableVersionCheck: boolean;
    version: string;
}

/**
 * Create/parse reciple config
 */
export class RecipleConfig {
    public config: Config = RecipleConfig.getDefaultConfig();
    public configPath: string = path.join(cwd, 'reciple.yml');
    public static defaultConfigPath = path.join(__dirname, '../../../../resource/reciple.yml');

    /**
     * @param configPath Path to config
     */
    constructor(configPath: string) {
        if (!configPath) throw new Error('Config path is not defined');
        this.configPath = configPath;
    }

    /**
     * Parse the config file
     */
    public parseConfig(): this {
        if (!existsSync(this.configPath)) {
            const defaultConfigPath = RecipleConfig.defaultConfigPath;
            if (!existsSync(defaultConfigPath)) throw new Error('Default Config file not found. Please reinstall Reciple.');

            const defaultConfig = replaceAll(readFileSync(defaultConfigPath, 'utf-8'), 'VERSION', version);
            
            writeFileSync(this.configPath, defaultConfig, 'utf-8');
            if (!existsSync(this.configPath)) throw new Error('Failed to create config file.');
            
            this.config = yaml.parse(defaultConfig);
            if (this.config && this.config.token === 'TOKEN') {
                this.config.token = this._askToken() || this.config.token;
                writeFileSync(this.configPath, replaceAll(defaultConfig, ' TOKEN', ` ${this.config.token}`), 'utf-8');
            }

            return this;
        }

        if (!existsSync(this.configPath)) throw new Error('Failed to read config file.');
        const config = readFileSync(this.configPath, 'utf-8');
        
        this.config = yaml.parse(config);

        if (!this._isSupportedConfig()) throw new Error('Unsupported config version. Your config version: '+ (this.config?.version || 'No version specified.') + ', Reciple version: '+ version);

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
     * @param askIfNull Ask for token if the token is null/undefined
     */
    public parseToken(askIfNull: boolean = true): string|null {
        let token = __token || this.config?.token || null;
        if (!token) return token || (askIfNull ? this._askToken() : null);

        const envToken = token.toString().split(':');
        if (envToken.length === 2 && envToken[0].toLocaleLowerCase() === 'env' && envToken[1]) {
            token = process.env[envToken[1]] || null;
        }

        return token || (askIfNull ? this._askToken() : null);
    }

    /**
     * Check if the config version is supported
     */
    protected _isSupportedConfig(): boolean {
        return isSupportedVersion(this.config?.version || '0.0.0', version);
    }

    /**
     * Ask for a token
     */
    protected _askToken(): string|null {
        return __token || input({ text: 'Bot Token >>> ', echo: '*', repeatIfEmpty: true, sigint: true }) || null;
    }

    /**
     * Get default config
     */
    public static getDefaultConfig(): Config {
        if (!existsSync(this.defaultConfigPath)) throw new Error("Default config file does not exists.");

        return yaml.parse(readFileSync(this.defaultConfigPath, 'utf-8'));
    }
}
