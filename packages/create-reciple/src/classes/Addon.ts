import fetchPackage, { AbbreviatedVersion } from 'package-json';
import { PackageJson } from 'fallout-utility';
import { tgz } from 'compressing';
import { createHash } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';

export interface AddonOptions {
    module: string;
    version?: string;
    /**
     * @default 'https://registry.npmjs.org'
     */
    registry?: string;
}

export interface AddonReadTarballData {
    packageJson: PackageJson;
    initialModuleContent: {
        js?: string;
        ts?: string;
    }
}

export class Addon implements AddonOptions {
    static readonly NPM_REGISTRY = 'https://registry.npmjs.org';
    static readonly YARN_REGISTRY = 'https://registry.yarnpkg.com';
    static readonly PNPM_REGISTRY = Addon.NPM_REGISTRY;
    static readonly BUN_REGISTRY = Addon.NPM_REGISTRY;
    static readonly DEFAULT_ADDON_VERSIONS = {
        'reciple-interaction-events': '^3',
        'reciple-anticrash': '^3',
        'reciple-dev-commands': '^3',
        'reciple-registry-cache': '^3',
    };

    public module: string;
    public version?: string;
    public registry?: string;
    public metadata?: AbbreviatedVersion;
    public tarball?: Buffer;
    public tarballData?: AddonReadTarballData;

    get tarballURL() { return this.metadata?.dist.tarball ?? null; }
    get tarballShasum() { return this.metadata?.dist.shasum ?? null; }
    get tmpDir() { return this.tarballShasum && path.join(path.dirname(fileURLToPath(import.meta.url)), '../../tmp', this.tarballShasum); }

    constructor(options: AddonOptions) {
        this.module = options?.module;
        this.registry = options?.registry ?? Addon.NPM_REGISTRY;
    }

    public async fetch(): Promise<AbbreviatedVersion> {
        this.metadata ??= await fetchPackage(this.module, { version: this.version, registry: this.registry });
        await this.downloadTarball();

        this.version = this.metadata.version;
        return this.metadata;
    }

    public async readTarball(): Promise<AddonReadTarballData> {
        if (!this.tarball || !this.tmpDir) throw new Error('Tarball not downloaded');
        if (this.tarballData) return this.tarballData;

        await tgz.uncompress(this.tarball, this.tmpDir);

        const packageJson = JSON.parse(await readFile(path.join(this.tmpDir, 'package/package.json'), 'utf-8'));
        let initialModuleContent: Exclude<AddonReadTarballData['initialModuleContent'], undefined> = {};

        if (('initialModuleContent' in packageJson)) {
            if (typeof packageJson.initialModuleContent === 'string') {
                const content = await readFile(path.join(this.tmpDir, 'package/', packageJson.initialModuleContent), 'utf-8');
                initialModuleContent.js = content;
                initialModuleContent.ts = content;
            } else {
                if ('js' in packageJson.initialModuleContent) initialModuleContent.js = await readFile(path.join(this.tmpDir, 'package/', packageJson.initialModuleContent.js), 'utf-8');
                if ('ts' in packageJson.initialModuleContent) initialModuleContent.ts = await readFile(path.join(this.tmpDir, 'package/', packageJson.initialModuleContent.ts), 'utf-8');
            }
        }

        return {
            packageJson,
            initialModuleContent
        };
    }

    protected async downloadTarball(): Promise<Buffer|undefined> {
        if (!this.tarballURL) return;
        if (this.tarball) return this.tarball;

        const response = await fetch(this.tarballURL);
        if (!response.ok) return;

        const data = await response.arrayBuffer();
        const buffer = Buffer.from(data);

        if (!await this.verifyTarball(buffer)) throw new Error('Tarball shasum does not match');

        return this.tarball = buffer;
    }

    protected async verifyTarball(buffer: Buffer): Promise<boolean> {
        const i = createHash('sha1');
        i.update(buffer);

        const shasum = i.digest('hex');

        return shasum === this.tarballShasum;
    }
}
