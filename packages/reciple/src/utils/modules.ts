import { lstat, mkdir, readdir } from 'node:fs/promises';
import { Awaitable } from 'fallout-utility/types';
import { RecipleConfig } from '../classes/Config';
import { existsSync } from 'node:fs';
import micromatch from 'micromatch';
import path from 'node:path';

export async function findModules(config: RecipleConfig['modules'], filter?: (filename: string) => Awaitable<boolean>): Promise<string[]> {
    const modules: string[] = [];
    const { globby, isDynamicPattern } = await import('globby');

    for (const folder of config.dirs) {
        const dir = path.isAbsolute(folder) ? folder : path.join(process.cwd(), folder);

        if (isDynamicPattern(folder, { cwd: process.cwd() })) {
            let dirs = await globby(folder, {
                    cwd: process.cwd(),
                    onlyDirectories: true,
                    absolute: true
                });

                dirs = dirs.filter(f => !micromatch.isMatch(path.basename(f), config.exclude));

            modules.push(...await findModules({
                ...config,
                dirs
            }));

            continue;
        }

        if (!existsSync(dir)) await mkdir(dir, { recursive: true });
        if (!(await lstat(dir)).isDirectory()) continue;

        const files = (await readdir(dir))
            .map(file => path.join(dir, file))
                .filter(f => !micromatch.isMatch(path.basename(f), config.exclude)
            )
            .filter(file => (filter ? filter(file) : file.endsWith('.js')));

        const addFile = async (file: string) => config.filter && await Promise.resolve(config.filter(file)) ? modules.push(file) : 0;

        await Promise.all(files.map(f => addFile));
    }

    return modules;
}
