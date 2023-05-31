import { existsSync, readFileSync } from 'fs';
import { RecipleError } from '@reciple/client';
import merge from 'lodash.mergewith';
import path from 'path';
import yml from 'yaml';

export function configMergeCustomizer(objValue: any, srcValue: any, key: string): any {
    if (Array.isArray(objValue)) return srcValue;
}

export function getConfigExtensions<T extends { extends?: string|string[]; }>(config: T, configPath?: string): T {
    if (!config.extends || Array.isArray(config.extends) && !config.extends.length) return config; 

    let extensions = typeof config.extends === 'string' ? [config.extends] : config.extends;
        extensions = extensions.map(e => configPath
            ? path.isAbsolute(e)
                ? e
                : path.join(path.dirname(configPath), e)
            : e);

    for (const extension of extensions) {
        if (!existsSync(extension)) throw new RecipleError({ message: `Config extension file doesn't exists: ${extension}`, name: 'InvalidConfigExtensionPath' });

        const configExtension = getConfigExtensions(yml.parse(readFileSync(extension, 'utf-8')), extension);

        config = merge(configExtension, config, configMergeCustomizer);
    }

    config.extends = extensions;

    return config;
}
