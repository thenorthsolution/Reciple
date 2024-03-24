import { PackageJson } from 'fallout-utility';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { existsAsync } from '../helpers/fileSystem';

export type ModuleType = 'module'|'commonjs';
export interface RecursiveDefault<T = unknown> {
    default?: T|RecursiveDefault<T>;
}

/**
 * Get module type of a directory
 * @param dir Path to dir
 * @param defaultType Default module type if none is detected
 */
export async function getDirModuleType(dir: string, defaultType: ModuleType = 'commonjs'): Promise<ModuleType> {
    if (!await existsAsync(dir)) return defaultType;

    const packageJSON = path.join(dir, 'package.json');
    if (!await existsAsync(packageJSON)) return defaultType;

    const data: PackageJson = JSON.parse(await readFile(packageJSON, 'utf-8'));

    return data.type ?? defaultType;
}

/**
 * Recursively get the default value of a value.
 * @param data The value to get the default value of.
 */
export function recursiveDefaults<T = unknown>(data: RecursiveDefault<T>|T): T|undefined {
    function isDefaults(object: any): object is RecursiveDefault<T> {
        return object?.default !== undefined;
    }

    if (!isDefaults(data)) return data;

    return recursiveDefaults(data.default!);
}
