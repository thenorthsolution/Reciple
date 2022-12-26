import { Config as RecipleConfig, Util } from '@reciple/client';
import { If, RestOrArray, normalizeArray } from 'discord.js';
import { PromptOptions, createReadFile, input, path, replaceAll } from 'fallout-utility';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import yml from 'yaml';

export interface ConfigParsePromptOptions extends PromptOptions {
    useWhenTokenIsEmpty: boolean;
}

export interface ConfigParseTokenOptions {
    token?: string;
    useWhenTokenIsEmpty: boolean;
}

export interface Config extends RecipleConfig {}

export class ConfigYml<Parsed extends boolean = boolean> {
    private _config: Config|null = null;

    readonly filePath: string = path.join(process.cwd(), 'reciple.yml');

    get config() { return this._config as If<Parsed, Config>; }

    constructor(filePath?: string) {
        this.filePath = filePath ?? this.filePath;
    }

    public parse(options?: ConfigParseTokenOptions|ConfigParsePromptOptions): Config {
        const init = !existsSync(this.filePath);
        const config = createReadFile(this.filePath, ConfigYml.defaultConfig, {
            encodeFileData: () => ConfigYml.defaultConfigYml,
            formatReadData: data => yml.parse(data as string),
            encoding: 'utf-8'
        });

        if ((init && config.token === 'TOKEN') || !config.token?.trim()) {
            config.token = ((options as ConfigParseTokenOptions)?.token ? (options as ConfigParseTokenOptions).token : input(options as ConfigParsePromptOptions)) || 'TOKEN';

            writeFileSync(this.filePath, ConfigYml.parseConfigPlaceholders(ConfigYml.defaultConfigYml, {
                name: 'TOKEN',
                value: config.token
            }));
        }

        this._config = config;
        return config;
    }

    public isParsed(): this is ConfigYml<true> {
        return this._config !== null;
    }

    static get defaultConfigYml(): string {
        return readFileSync(path.join(__dirname, '../../../static/config.yml'), 'utf-8');
    }

    static get defaultConfig(): Config {
        return yml.parse(this.parseConfigPlaceholders(readFileSync(path.join(__dirname, '../../static/config.yml'), 'utf-8')));
    }

    public static parseConfigPlaceholders(content: string, ...placeholders: RestOrArray<{ name: string; value: string; }>): string {
        return yml.parse(replaceAll(content, [
            'VERSION',
            ...normalizeArray(placeholders).map(placeholder => placeholder.name)
        ], [
            Util.version,
            ...normalizeArray(placeholders).map(placeholder => placeholder.value)
        ]));
    }
}
