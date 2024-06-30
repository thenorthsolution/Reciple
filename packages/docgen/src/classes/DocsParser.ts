import { Application, TSConfigReader, type JSONOutput, type OptionsReader, type ProjectReflection } from 'typedoc';
import type { Docs, DocsParserCustomPagesData } from '../types/docs.js';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { ProjectParser } from 'typedoc-json-parser';
import { dirname, join, resolve } from 'node:path';
import { Collection } from '@discordjs/collection';
import { existsAsync } from '@reciple/utils';

export interface DocsParserOptions extends Omit<ProjectParser.Options, 'data'> {
    files: string[];
    optionsReader?: OptionsReader;
    custom?: string;
    readme?: string;
}

export class DocsParser {
    private _project: ProjectReflection|null = null;
    private _data: JSONOutput.ProjectReflection|null = null;
    private _parser: ProjectParser|null = null;

    public typedoc?: Application;

    readonly customPages: Collection<string, Collection<string, Docs['customPages'][0]['files'][0]>> = new Collection();

    get project() { return this._project; }
    get data() { return this._data; }
    get parser() { return this._parser; }

    get classes() { return this.parser?.classes ?? []; }
    get enums() { return this.parser?.enums ?? []; }
    get functions() { return this.parser?.functions ?? []; }
    get interfaces() { return this.parser?.interfaces ?? []; }
    get namespaces() { return this.parser?.namespaces ?? []; }
    get typeAliases() { return this.parser?.typeAliases ?? []; }
    get variables() { return this.parser?.variables ?? []; }

    constructor(private options: DocsParserOptions) {}

    public async parse(): Promise<Docs|undefined> {
        const ProjectParser = (await import('typedoc-json-parser')).ProjectParser;

        this.typedoc = await Application.bootstrap({
            entryPoints: this.options.files,
            skipErrorChecking: true,
            compilerOptions: {
                rootDir: process.cwd()
            }
        });

        this.typedoc?.options.addReader(this.options.optionsReader ?? new TSConfigReader());

        this._project = await this.typedoc.convert() ?? null;
        this._data = this._project && this.typedoc.serializer.projectToObject(this._project, process.cwd());
        this._parser = this._data && new ProjectParser({
            ...this.options,
            data: this._data,
            readme: this.options.readme ? await readFile(this.options.readme, 'utf-8') : undefined,
            dependencies: {}
        });

        const customFile = this.options.custom ? resolve(this.options.custom) : null;
        const customDir = customFile && dirname(customFile);
        if (!customDir || !customFile || !this.parser) return this.parser ? this.toJSON() : undefined;

        const customData: DocsParserCustomPagesData = JSON.parse(await readFile(this.options.custom!, 'utf-8'));

        this.customPages.clear();

        if (customData?.length && Array.isArray(customData)) {
            for (const category of customData) {
                const pages = this.customPages.get(category.category) || this.customPages.set(category.category, new Collection()).get(category.category)!;

                for (const file of category.files) {
                    const location = join(customDir, file.file);
                    const data: Docs['customPages'][0]['files'][0] = {
                        id: file.id,
                        name: file.name,
                        content: await readFile(location, 'utf-8')
                    };

                    pages.set(file.id, data);
                }
            }
        }

        return this.toJSON();
    }

    public toJSON(): Docs {
        if (!this.parser) throw new Error('There is no parser data');

        return {
            ...this.parser.toJSON(),
            customPages: this.customPages.map((pages, category) => ({
                category,
                files: Array.from(pages.values())
            })),
            parsedAt: Date.now()
        };
    }

    public async save(options: { file: string; encoder?: ((data: Docs) => (string|PromiseLike<string>)); pretty?: boolean; }): Promise<void> {
        if (!await existsAsync(options.file)) await mkdir(dirname(options.file), { recursive: true });

        const data = options.encoder ? await Promise.resolve(options.encoder(this.toJSON())) : JSON.stringify(this.toJSON(), null, options.pretty ? 2 : undefined);

        await writeFile(options.file, data, 'utf-8');
    }
}
 