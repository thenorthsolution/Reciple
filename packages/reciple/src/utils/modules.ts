import type { RecipleConfig } from '../classes/Config.js';
import { lstat, mkdir, readdir } from 'node:fs/promises';
import type { Awaitable } from 'fallout-utility/types';
import { existsAsync } from '@reciple/utils';
import micromatch from 'micromatch';
import path from 'node:path';

/**
 * Recursively finds modules in specified directories based on the given configuration.
 *
 * @param {RecipleConfig['modules']} config - The configuration object containing directories and filters.
 * @param {((filename: string) => Awaitable<boolean>)?} filter - An optional function to filter files.
 * @return {Promise<string[]>} A promise that resolves to an array of module file paths.
 */
export async function findModules(config: RecipleConfig['modules'], filter?: (filename: string) => Awaitable<boolean>): Promise<string[]> {
    const modules: string[] = [];
    const { globby, isDynamicPattern } = await import('globby');

    for (const folder of config?.dirs ?? []) {
        const dir = path.isAbsolute(folder) ? folder : path.join(process.cwd(), folder);

        if (isDynamicPattern(folder, { cwd: process.cwd() })) {
            let dirs = await globby(folder, {
                    cwd: process.cwd(),
                    onlyDirectories: true,
                    absolute: true
                });

                if (config?.exclude?.length) dirs = dirs.filter(f => !micromatch.isMatch(path.basename(f), config.exclude!));

            modules.push(...await findModules({
                ...config,
                dirs
            }));

            continue;
        }

        if (!await existsAsync(dir)) await mkdir(dir, { recursive: true });
        if (!(await lstat(dir)).isDirectory()) continue;

        const files = (await readdir(dir))
            .map(file => path.join(dir, file))
                .filter(f => !config?.exclude?.length || !micromatch.isMatch(path.basename(f), config.exclude)
            )
            .filter(file => (filter ? filter(file) : file.endsWith('.js')));

        const addFile = async (file: string) => !config?.filter || await Promise.resolve(config.filter(file)) ? modules.push(file) : 0;

        await Promise.all(files.map(f => addFile(f)));
    }

    return modules;
}

export const moduleFilesFilter = (file: string) => file.endsWith('.js') || file.endsWith('.cjs') || file.endsWith('.mjs');
