import { PackageJson } from 'fallout-utility';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

export type ModuleType = 'module'|'commonjs';

export async function getDirModuleType(dir: string, defaultType: ModuleType = 'commonjs'): Promise<ModuleType> {
    if (!existsSync(dir)) return defaultType;

    const packageJSON = path.join(dir, 'package.json');
    if (!existsSync(packageJSON)) return defaultType;

    const data: PackageJson = JSON.parse(await readFile(packageJSON, 'utf-8'));

    return data.type ?? defaultType;
}
