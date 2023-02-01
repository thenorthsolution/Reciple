import { Collection, RestOrArray, normalizeArray } from 'discord.js';
import { RecipleClient } from '../RecipleClient';
import { RecipleModule, RecipleModuleScript } from '../RecipleModule';
import { path } from 'fallout-utility';
import semver from 'semver';

export interface ModuleManagerOptions {
    client: RecipleClient;
    modules?: (RecipleModule|RecipleModuleScript)[];
}

export class ModuleManager {
    readonly client: RecipleClient;
    readonly modules: Collection<string, RecipleModule> = new Collection();

    constructor(options: ModuleManagerOptions) {
        this.client = options.client;
        options.modules?.forEach(m => m instanceof RecipleModule ? this.modules.set(m.id, m) : new RecipleModule({ client: this.client, script: m }))
    }

    public async resolveModuleFiles(files: string[], disableVersionCheck: boolean = false): Promise<RecipleModule[]> {
        const modules: RecipleModule[] = [];

        for (const file of files) {
            const filePath = (path.isAbsolute(file) ? 'file://' : '') + file;

            try {
                const resolveFile = await import(filePath);

                const script: RecipleModuleScript | RecipleModule | undefined =
                    resolveFile instanceof RecipleModule || this.isRecipleModuleScript(resolveFile)
                        ? resolveFile
                        : resolveFile?.default?.default instanceof  RecipleModule || this.isRecipleModuleScript(resolveFile)
                            ? resolveFile.default.default
                            : resolveFile?.default;

                if (script instanceof RecipleModule) {
                    modules.push(script);
                    continue;
                }

                this.validateScript(script);

                if (!disableVersionCheck && !normalizeArray([script.versions] as RestOrArray<string>)?.some(v => semver.satisfies(this.client.version, v))) {
                    throw new Error(`Unsupported module: ${filePath}`);
                }

                modules.push(
                    new RecipleModule({
                        client: this.client,
                        script,
                        filePath,
                    })
                );
            } catch(err) {
                this.client._throwError(err as Error);
            }
        }

        return modules;
    }

    public isRecipleModuleScript(script: unknown): script is RecipleModuleScript {
        try {
            this.validateScript(script);
            return true;
        } catch(err) {
            return false;
        }
    }

    public validateScript(script: unknown): asserts script is RecipleModuleScript {
        const s = script as Partial<RecipleModuleScript>;

        if (typeof s !== 'object') return this.client._throwError(new Error(`Invalid Reciple module script`));
        if (typeof s.versions !== 'string' && !Array.isArray(s.versions)) return this.client._throwError(new Error(`Invalid module supported versions`));
        if (typeof s.onStart !== 'function') return this.client._throwError(new Error(`Module's "onStart" property is not a valid function`));
        if (s.onLoad && typeof s.onLoad !== 'function') return this.client._throwError(new Error(`Module's "onLoad" property is not a valid function`));
        if (s.onUnload && typeof s.onUnload !== 'function') return this.client._throwError(new Error(`Module's "onUnload" property is not a valid function`));
    }
}
