import { RecipleClient, RecipleModule, RecipleModuleScript, RecipleModuleScriptUnloadData } from '@reciple/client';
import { existsSync, lstatSync, readFileSync, readdirSync } from 'fs';
import { Logger } from '@reciple/client';
import path from 'path';

export class RecipleNPMLoader implements RecipleModuleScript {
    readonly versions: string = JSON.parse(readFileSync(path.join(__dirname, '../package.json'), 'utf-8')).peerDependencies['@reciple/client'];
    readonly modules: RecipleModule[] = [];

    public client!: RecipleClient;
    public logger?: Logger;
    public nodeModulesFolder: string = path.join(process.cwd(), 'node_modules');
    public disableVersionChecks: boolean = false;

    constructor(options?: { nodeModulesFolder?: string; disableVersionChecks?: boolean; }) {
        if (options?.nodeModulesFolder) this.nodeModulesFolder = options.nodeModulesFolder;
        if (options?.disableVersionChecks) this.disableVersionChecks = options.disableVersionChecks;
    }

    public async onStart(client: RecipleClient<false>): Promise<boolean> {
        this.client = client;
        this.logger = client.logger?.clone({ name: 'NPMLoader' });

        this.modules.push(...await this.getModules(this.nodeModulesFolder));

        this.logger?.log(`Found (${this.modules.length}) NPM Reciple modules`);

        await this.client.modules.startModules({
            modules: this.modules,
            addToModulesCollection: true
        });

        return true;
    }

    public async onLoad(): Promise<void> {
        await this.client.modules.loadModules({
            modules: this.modules,
            resolveCommands: true
        });
    }

    public async onUnload(unloadData: RecipleModuleScriptUnloadData): Promise<void> {
        await this.client.modules.unloadModules({
            modules: this.modules,
            reason: unloadData.reason,
            removeCommandsFromClient: true,
            removeFromModulesCollection: true
        });
    }

    public async getModules(npmModules: string): Promise<RecipleModule[]> {
        if (!existsSync(npmModules)) return [];

        this.logger?.debug(`Loading modules from '${npmModules}'`);

        const contents = readdirSync(npmModules).map(f => path.join(npmModules, f)).filter(f => lstatSync(f).isDirectory());
        const folders = contents.filter(f => !path.basename(f).startsWith('@'));
        const withSubfolders = contents.filter(f => path.basename(f).startsWith('@'));

        this.logger?.debug(`Found (${folders.length}) node_modules package folders.`);
        this.logger?.debug(`Found (${withSubfolders.length}) node_modules folders with package subfolders.`);

        const moduleFiles: string[] = [];

        for (const folder of folders) {
            if (!await this.isValidModuleFolder(folder)) continue;

            const packageJson: { keywords: string[]; recipleModule: string; } = JSON.parse(readFileSync(path.join(folder, 'package.json'), 'utf-8'));
            const moduleFile: string = path.join(folder, packageJson.recipleModule);

            moduleFiles.push(moduleFile);
        }

        for (const folder of withSubfolders) {
            const subFolders = readdirSync(folder).map(f => path.join(folder, f)).filter(f => lstatSync(f).isDirectory());

            for (const subFolder of subFolders) {
                if (!await this.isValidModuleFolder(subFolder)) continue;

                const packageJson: { keywords: string[]; recipleModule: string; } = JSON.parse(readFileSync(path.join(subFolder, 'package.json'), 'utf-8'));
                const moduleFile: string = path.join(subFolder, packageJson.recipleModule);

                moduleFiles.push(moduleFile);
            }
        }

        if (moduleFiles.length) this.logger?.debug(`Loading modules:\n  `, moduleFiles.join('\n  '));

        return this.client.modules.resolveModuleFiles(moduleFiles, this.disableVersionChecks);
    }

    public async isValidModuleFolder(folder: string): Promise<boolean> {
        const packageJsonPath = path.join(folder, 'package.json');
        if (!existsSync(packageJsonPath)) return false;

        const packageJson: { keywords?: string[]; recipleModule?: string; } = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
        if (!packageJson.recipleModule || !existsSync(path.join(folder, packageJson.recipleModule))) return false;
        if (!packageJson.keywords?.includes('reciple-module')) return false;

        return true;
    }
}
