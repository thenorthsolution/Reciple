import { lstat, mkdir, readdir } from 'node:fs/promises';
import { Awaitable } from 'fallout-utility';
import { RecipleConfig } from '../classes/Config';
import { existsSync } from 'node:fs';
import micromatch from 'micromatch';
import path from 'node:path';

export async function findModules(config: RecipleConfig['modules'], filter?: (filename: string) => Awaitable<boolean>): Promise<string[]> {
    const modules: string[] = [];
    const { globby, isDynamicPattern } = await import('globby');

    for (const folder of config.modulesFolders) {
        const dir = path.isAbsolute(folder) ? folder : path.join(process.cwd(), folder);

        if (isDynamicPattern(folder, { cwd: process.cwd() })) {
            let modulesFolders = await globby(folder, {
                    cwd: process.cwd(),
                    onlyDirectories: true,
                    absolute: true
                });

                modulesFolders = modulesFolders.filter(f => !micromatch.isMatch(path.basename(f), config.exclude));

            modules.push(...await findModules({
                ...config,
                modulesFolders
            }));

            continue;
        }

        if (!existsSync(dir)) await mkdir(dir, { recursive: true });
        if (!(await lstat(dir)).isDirectory()) continue;

        const files = (await readdir(dir)).map(file => path.join(dir, file)).filter(f => !micromatch.isMatch(path.basename(f), config.exclude));
        modules.push(...files.filter(file => (filter ? filter(file) : file.endsWith('.js'))));
    }

    return modules;
}
