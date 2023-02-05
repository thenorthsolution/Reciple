import { Awaitable, path } from 'fallout-utility';
import { IConfig } from '../classes/Config';
import { cwd } from './cli';
import { existsSync, lstatSync, mkdirSync, readdirSync } from 'fs';

export async function getModules(config: IConfig['modules'], filter?: (filename: string) => Awaitable<boolean>): Promise<string[]> {
    const modules: string[] = [];
    const { globby, isDynamicPattern } = await import('globby');

    for (const folder of config.modulesFolders) {
        const dir = path.isAbsolute(folder) ? folder : path.join(cwd, folder);

        if (isDynamicPattern(dir)) {

            modules.push(...await getModules({
                ...config,
                modulesFolders: await globby(dir, {
                    cwd,
                    gitignore: true,
                    ignore: config.exclude.map(p => path.isAbsolute(p) ? p : path.join(cwd, p)),
                    onlyDirectories: true,
                    absolute: true
                })
            }));
            continue;
        }

        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        if (!lstatSync(dir).isDirectory()) continue;

        const files = readdirSync(dir).map(file => path.join(dir, file));
        modules.push(...files.filter(file => (filter ? filter(file) : file.endsWith('.js'))));
    }

    return modules;
}
