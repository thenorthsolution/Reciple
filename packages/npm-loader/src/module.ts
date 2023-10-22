import { RecipleClient, RecipleModule, Logger, RecipleModuleStartData, RecipleModuleData, RecipleError } from '@reciple/core';
import { readFile, readdir, readlink, stat } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { sliceIntoChunks } from '@reciple/utils';
import { Worker } from 'node:worker_threads';

export interface WorkerScannedFolderData {
    folder: string;
    moduleFile: string|null;
    valid: boolean;
}

export interface WorkerData {
    folders: string[];
    ignoredPackages: string[];
    dependencies: Record<string, string>;
}

export interface PartialPackageJson {
    name: string;
    description?: string;
    keywords?: string[];
    recipleModule?: string;
    type?: "module"|"commonjs";
    main?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
}

export interface RecipleNPMLoaderOptions {
    /**
     * The node_modules folder path
     */
    nodeModulesFolder?: string;
    /**
     * Define to only use modules that are in package.json dependencies and dev dependencies
     */
    packageJsonPath?: string;
    /**
     * Disables version check when starting modules
     */
    disableVersionChecks?: boolean;
    /**
     * Ignored package names
     */
    ignoredPackages?: string[];
    /**
     * Number of folders scanned by each workers. Falsy to disable workers
     * @experimental
     * @default null
     */
    foldersPerWorker?: number|null;
}

export class RecipleNPMLoader implements RecipleModuleData, RecipleNPMLoaderOptions {
    readonly id: string = 'com.reciple.npm-loader';
    readonly name: string = '@reciple/npm-loader';
    readonly versions: string = JSON.parse(readFileSync(path.join(__dirname, '../package.json'), 'utf-8')).peerDependencies['@reciple/core'];

    public modules: RecipleModule[] = [];
    public client!: RecipleClient;
    public logger?: Logger;

    public nodeModulesFolder: string;
    public packageJsonPath?: string;
    public disableVersionChecks: boolean;
    public ignoredPackages: string[];
    public foldersPerWorker: number|null = null;

    static readonly workersFolder: string = path.join(__dirname, './workers');

    constructor(options?: RecipleNPMLoaderOptions) {
        this.nodeModulesFolder = options?.nodeModulesFolder ?? path.join(process.cwd(), 'node_modules');
        this.packageJsonPath = options?.packageJsonPath;
        this.disableVersionChecks = options?.disableVersionChecks ?? false;
        this.ignoredPackages = options?.ignoredPackages ?? [];
        this.foldersPerWorker = options?.foldersPerWorker ?? null;
    }

    public async onStart({ client }: RecipleModuleStartData): Promise<boolean> {
        this.client = client;
        this.logger = client.logger?.clone({ name: 'NPMLoader' });

        this.modules = (await this.getModules(this.nodeModulesFolder)).filter(m => !this.isModuleIdLoaded(m.id));
        this.logger?.log(`Found (${this.modules.length}) NPM Reciple modules`);

        await this.client.modules.startModules({ modules: this.modules });

        return true;
    }

    /**
     * Get valid modules from given node_modules folder
     * @param node_modules The node_modules folder
     */
    public async getModules(node_modules: string): Promise<RecipleModule[]> {
        if (!existsSync(node_modules)) return [];

        this.logger?.debug(`Loading modules from '${node_modules}'`);

        const packageJson = this.packageJsonPath ? await RecipleNPMLoader.getPackageJson(this.packageJsonPath) : null;
        const dependencies = packageJson ? { ...packageJson?.dependencies, ...packageJson?.devDependencies } : null;

        let contents: string[] = [];

            if (!packageJson) {
                contents = (await readdir(node_modules)).map(f => path.join(node_modules, f));
            } else {
                for (const dependency of Object.keys(dependencies ?? {})) {
                    const location = path.join(node_modules, dependency);
                    if (!existsSync(location)) continue;

                    contents.push(location);
                }
            }

            contents = await Promise.all(contents.filter(async f => (await stat(f)).isDirectory() || (await stat(f)).isSymbolicLink()));

        const folders = await Promise.all(contents.filter(f => !path.basename(f).startsWith('@')).map(async f => (await stat(f)).isSymbolicLink() ? path.join(process.cwd(), await readlink(f)) : f));
        const withSubfolders = await Promise.all(contents.filter(f => path.basename(f).startsWith('@')).map(async f => (await stat(f)).isSymbolicLink() ? path.join(process.cwd(), await readlink(f)) : f));

        this.logger?.debug(`Found (${folders.length}) node_modules package folders.`);
        this.logger?.debug(`Found (${withSubfolders.length}) node_modules folders with package subfolders.`);

        for (const folder of withSubfolders) {
            const subFolders = await Promise.all((await readdir(folder)).map(f => path.join(folder, f)).filter(async f => (await stat(f)).isDirectory()));
            folders.push(...subFolders);
        }

        const moduleFiles: string[] = await this.getModuleFilesFromFolders(folders, {
            foldersPerWorker: this.foldersPerWorker,
            dependencies: dependencies ?? undefined
        });

        if (moduleFiles.length) this.logger?.debug(`Loading modules:\n  `, moduleFiles.join('\n  '));

        return this.client.modules.resolveModuleFiles({
            files: moduleFiles,
            disableVersionCheck: this.disableVersionChecks,
            cacheModules: false
        });
    }

    public async getModuleFilesFromFolders(folders: string[], options?: { foldersPerWorker?: number|null; dependencies?: Record<string, string>; }): Promise<string[]> {
        if (!options?.foldersPerWorker) {
            const moduleFiles: string[] = [];

            const scanFolder = async (folder: string) => {
                const isValid = await RecipleNPMLoader.isValidModuleFolder(folder, {
                    dependencies: options?.dependencies ?? undefined,
                    ignoredPackages: this.ignoredPackages
                });

                this.logger?.debug(isValid, folder);
                if (!isValid) return;

                const packageJson = await RecipleNPMLoader.getPackageJson(path.join(folder, 'package.json'), true);
                const moduleFile: string = path.join(folder, packageJson.recipleModule);

                moduleFiles.push(moduleFile);
            }

            await Promise.all(folders.map(f => scanFolder(f)));
            return moduleFiles;
        }

        const workersData: WorkerData[] = sliceIntoChunks(folders, options.foldersPerWorker).map(f => ({
            folders: f,
            dependencies: options.dependencies ?? {},
            ignoredPackages: this.ignoredPackages
        }));

        return (await Promise.all(
            workersData.map(d => RecipleNPMLoader.getModuleFilesWithWorker(d).then(data => {
                if (!this.logger) return data.moduleFiles;

                this.logger.debug(`Scanned Folders (worker: ${data.threadId}):`);

                for (const scannedFolder of data.scannedFolders) {
                    this.logger.debug(scannedFolder.valid, scannedFolder.folder);
                }

                return data.moduleFiles;
            }))
        )).reduce((v, c) => { v.push(...c); return v; }, []);
    }

    /**
     * Check if the give module id is already used in loaded client modules
     * @param id The module id
     */
    public isModuleIdLoaded(id: string): boolean {
        return !!this.client.modules.cache.get(id);
    }

    /**
     * Check if folder is a contains valid reciple module
     * @param folder The module folder
     * @param packageJsonDependencies Define to check if the module is in dependencies
     */
    public static async isValidModuleFolder(folder: string, options?: { ignoredPackages?: string[]; dependencies?: Record<string, string>; }): Promise<boolean> {
        const packageJsonPath = path.join(folder, 'package.json');
        if (!existsSync(packageJsonPath)) return false;

        const packageJson = await RecipleNPMLoader.getPackageJson(packageJsonPath);
        if (options?.ignoredPackages?.includes(packageJson.name)) return false;
        if (options?.dependencies && !options.dependencies[packageJson.name]) return false;
        if (!packageJson.recipleModule || !existsSync(path.join(folder, packageJson.recipleModule))) return false;
        if (!packageJson.keywords?.includes('reciple-module')) return false;

        return true;
    }

    /**
     * Get package.json partial contents
     * @param file The package.json path
     * @param isRecipleModule Reciple module type guard
     */
    public static async getPackageJson(file: string, isRecipleModule?: false): Promise<PartialPackageJson>;
    public static async getPackageJson(file: string, isRecipleModule: true): Promise<PartialPackageJson & { recipleModule: string; keywords: string[]; }>;
    public static async getPackageJson(file: string, _isRecipleModule?: boolean): Promise<PartialPackageJson> {
        return JSON.parse(await readFile(file, 'utf-8'));
    }

    public static async getModuleFilesWithWorker(data: WorkerData): Promise<{ threadId: number; scannedFolders: WorkerScannedFolderData[]; moduleFiles: string[] }> {
        let threadId: number = 0;

        let scannedFolders: WorkerScannedFolderData[] = [];

        await new Promise((res, rej) => {
            const worker = new Worker(path.join(RecipleNPMLoader.workersFolder, 'getModuleFiles.mjs'), { workerData: data });
            const terminate = () => worker.terminate().catch(() => {});

            threadId = worker.threadId;

            worker.on('error', async err => {
                await terminate();
                rej(err);
            });

            worker.on('message', async data => {
                if (!Array.isArray(data)) return;

                scannedFolders = data;
                await terminate();
                res(void 0);
            });

            worker.on('exit', () => {
                if (!scannedFolders.length) rej(new RecipleError('Worker exited unexpectedly'));
            });
        });

        return {
            threadId,
            scannedFolders,
            moduleFiles: scannedFolders.filter(s => s.valid && s.moduleFile).map(s => s.moduleFile!)
        };
    }
}
