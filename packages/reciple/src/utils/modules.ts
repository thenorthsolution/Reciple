import { lstat, mkdir, readdir } from 'node:fs/promises';
import { recursiveDefaults } from '@reciple/client';
import { Awaitable } from 'fallout-utility';
import { IConfig } from '../classes/Config';
import { existsSync } from 'node:fs';
import micromatch from 'micromatch';
import path from 'node:path';
import { cli } from './cli';

export async function getModules(config: IConfig['modules'], filter?: (filename: string) => Awaitable<boolean>): Promise<string[]> {
    const modules: string[] = [];
    const { globby, isDynamicPattern } = await import('globby');

    for (const folder of config.modulesFolders) {
        const dir = path.isAbsolute(folder) ? folder : path.join(cli.cwd, folder);

        if (isDynamicPattern(folder, { cwd: cli.cwd })) {
            let modulesFolders = await globby(folder, {
                    cwd: cli.cwd,
                    onlyDirectories: true,
                    absolute: true
                });

                modulesFolders = modulesFolders.filter(f => !micromatch.isMatch(path.basename(f), config.exclude));

            modules.push(...await getModules({
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

export async function getJsConfig<T>(file: string): Promise<T|undefined> {
    file = path.resolve(path.isAbsolute(file) ? file : path.join(cli.cwd, file));

    return recursiveDefaults<T>(await import(`file://${file}`));
}
