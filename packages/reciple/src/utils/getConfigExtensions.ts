import { existsSync, readFileSync } from 'fs';
import merge from 'lodash.merge';
import path from 'path';
import yml from 'yaml';

export function getConfigExtensions<T extends { extends?: string|string[]; }>(config: T, configPath?: string): T {
    if (!config.extends || Array.isArray(config.extends) && !config.extends.length) return config; 

    const extensions = typeof config.extends === 'string' ? [config.extends] : config.extends;

    for (const extension of extensions) {
        const configExtensionPath = configPath
            ? path.isAbsolute(extension)
                ? extension
                : path.join(path.dirname(configPath), extension)
            : extension;

        if (!existsSync(configExtensionPath)) throw new Error(`Config extension file doesn't exists: ${configExtensionPath}`);

        const configExtension = getConfigExtensions(yml.parse(readFileSync(configExtensionPath, 'utf-8')), configExtensionPath);

        config = merge(configExtension, config);
    }

    config.extends = extensions;

    return config;
}
