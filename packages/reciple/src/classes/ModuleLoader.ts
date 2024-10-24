import { type Awaitable, kleur } from 'fallout-utility';
import type { RecipleConfig } from '../types/structures.js';
import path from 'node:path';
import { existsAsync } from '@reciple/utils';
import { lstat, mkdir, readdir } from 'node:fs/promises';
import type { RecipleModule } from '@reciple/core';
import type { RecipleClient } from '../index.js';
import { setTimeout as sleep } from 'node:timers/promises';

export interface ModuleLoaderGetModulePathsOptions {
    config: Exclude<RecipleConfig['modules'], undefined>;
    filter?: (file: string) => Awaitable<boolean>;
    cwd?: string;
}

export interface ModuleLoaderActionData {
    success: RecipleModule[];
    failed: RecipleModule[];
}

export class ModuleLoader {
    public static globby?: typeof import('globby');
    public static stopping: boolean = false;

    private constructor() {}

    public static async getModulePaths(options: ModuleLoaderGetModulePathsOptions): Promise<string[]> {
        const paths: string[] = [];
        const { globby, isDynamicPattern } = await ModuleLoader.getGlobby();
        const cwd = options?.cwd ?? process.cwd();

        for (const folder of options.config.dirs) {
            const folderPath = path.isAbsolute(folder) ? folder : path.join(cwd, folder);

            if (isDynamicPattern(folder, { cwd })) {
                let dirs = await globby(folder, {
                        cwd: process.cwd(),
                        onlyDirectories: true,
                        absolute: true,
                        ignore: options.config.exclude
                    });

                paths.push(...await ModuleLoader.getModulePaths({
                    ...options,
                    config: {
                        ...options.config,
                        dirs
                    }
                }));

                continue;
            }

            if (!await existsAsync(folderPath)) await mkdir(folderPath, { recursive: true });
            if (!(await lstat(folderPath)).isDirectory()) continue;

            const files = (await readdir(folderPath))
                .map(file => path
                    .join(folderPath, file))
                    .filter(file => (options.filter ? options.filter(file) : ModuleLoader.defaultModulePathsFilter(file)));

            await Promise.all(files.map(async f => {
                if (options.config.filter) {
                    const allowed = !!await Promise.resolve(options.config.filter(f));
                    if (!allowed) return;
                }

                if (!await existsAsync(f)) return;

                paths.push(f);
            }));
        }

        if (options.config?.sort) paths.sort(options.config.sort);

        return paths;
    }

    public static async startModules(client: RecipleClient, modules: RecipleModule[]): Promise<ModuleLoaderActionData> {
        const success: RecipleModule[] = await client.modules.startModules({ modules });
        const failed: RecipleModule[] = modules.filter(m => !success.some(s => s.id === m.id));

        return { success, failed };
    }

    public static async loadModules(client: RecipleClient, modules: RecipleModule[]): Promise<ModuleLoaderActionData> {
        const success: RecipleModule[] = await client.modules.loadModules({ modules });
        const failed: RecipleModule[] = modules.filter(m => !success.some(s => s.id === m.id));

        return { success, failed };
    }

    public static async unloadModules(client: RecipleClient, modules: RecipleModule[]): Promise<ModuleLoaderActionData> {
        const success: RecipleModule[] = await client.modules.unloadModules({ modules });
        const failed: RecipleModule[] = modules.filter(m => !success.some(s => s.id === m.id));

        return { success, failed };
    }

    public static async processExitHandleModuleUnload(client: RecipleClient, signal: NodeJS.Signals): Promise<void> {
        if (ModuleLoader.stopping) return;

        ModuleLoader.stopping = true;

        client.logger?.warn(`Received exit signal: ${signal}`);

        await client.destroy(true);

        const signalString = signal === 'SIGINT' ? 'keyboard interrupt' : signal === 'SIGTERM' ? 'terminate' : String(signal);

        await sleep(10);
        client.logger?.warn(`Process exited: ${kleur.yellow(signalString)}`);
        client.logger?.closeFileWriteStream();

        process.exit(0);
    }

    public static defaultModulePathsFilter(file: string): Awaitable<boolean> {
        return file.endsWith('.js') || file.endsWith('.mjs');
    }

    public static async getGlobby(): Promise<typeof import('globby')> {
        if (ModuleLoader.globby) return ModuleLoader.globby;

        return (ModuleLoader.globby = await import('globby'));
    }
}
