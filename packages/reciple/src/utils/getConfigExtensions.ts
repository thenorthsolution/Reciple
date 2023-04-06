import { existsSync, readFileSync } from 'fs';
import path from 'path';
import yml from 'yaml';
import merge from 'lodash.merge';

export function getConfigExtensions<T extends { extends?: string; }>(config: T, configPath?: string): T {
    if (!config.extends) return config; 

    const configExtensionPath = configPath
        ? path.isAbsolute(config.extends)
            ? config.extends
            : path.join(path.dirname(configPath), config.extends)
        : config.extends;

    if (!existsSync(configExtensionPath)) throw new Error(`Config extension file doesn't exists: ${configExtensionPath}`);

    const configExtension = getConfigExtensions(yml.parse(readFileSync(configExtensionPath, 'utf-8')), configExtensionPath);

    config = merge(config, configExtension);
    config.extends = configExtensionPath;

    return config;
}
