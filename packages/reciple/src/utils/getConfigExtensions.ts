import { existsSync, readFileSync } from 'fs';
import merge from 'lodash.merge';
import path from 'path';
import yml from 'yaml';

export function getConfigExtensions<T extends { extends?: string|string[]; }>(config: T, configPath?: string): T {
    if (!config.extends || Array.isArray(config.extends) && !config.extends.length) return config; 

    let extensions = typeof config.extends === 'string' ? [config.extends] : config.extends;
        extensions = extensions.map(e => configPath
            ? path.isAbsolute(e)
                ? e
                : path.join(path.dirname(configPath), e)
            : e);

    for (const extension of extensions) {
        if (!existsSync(extension)) throw new Error(`Config extension file doesn't exists: ${extension}`);

        const configExtension = getConfigExtensions(yml.parse(readFileSync(extension, 'utf-8')), extension);

        config = merge(configExtension, config);
    }

    config.extends = extensions;

    return config;
}
