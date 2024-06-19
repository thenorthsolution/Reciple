import { existsAsync } from '@reciple/utils';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { ConfigReader } from 'reciple';
import detectIndentSize from 'detect-indent';

export interface ConfigOptions {
    dir?: string;
}

export class Config {
    public dir: string;
    public content: string = '';

    get filePath() {
        return path.join(this.dir, 'reciple.mjs');
    }

    get indent() {
        return detectIndentSize(this.content).indent ?? '    ';
    }

    constructor(options: ConfigOptions) {
        this.dir = options.dir ?? process.cwd();
    }

    public async setup(options?: Partial<Record<'halts'|'preconditions', { class: string; from: string; }[]>>): Promise<this> {
        await this.readContent();

        if (options?.preconditions?.length) this.addPreconditions(options.preconditions);
        if (options?.halts?.length) this.addHalts(options.halts);

        await this.saveContent();
        return this;
    }

    public addPreconditions(preconditions: { class: string; from: string; }[]): void {
        this.content = this.content.replaceAll(`new CommandPermissionsPrecondition()`, `new CommandPermissionsPrecondition(),\n${this.indent.repeat(2)}${preconditions.map(precondition => `new ${precondition.class}(),`).join('\n' + this.indent.repeat(2))}`);
        for (const precondition of preconditions) {
            this.addImport(precondition.class, precondition.from);
        }
    }

    public addHalts(halts: { class: string; from: string; }[]): void {
        this.content = this.content.replaceAll(`commandHalts: []`, `commandHalts: [\n${this.indent.repeat(2)}${halts.map(halt => `new ${halt.class}(),`).join('\n' + this.indent.repeat(2))}\n${this.indent}]`);
        for (const halt of halts) {
            this.addImport(halt.class, halt.from);
        }
    }

    public addImport(imports: string|string[], from: string): void {
        this.content = this.content.replace(`import { IntentsBitField } from 'discord.js';`, `import { IntentsBitField } from 'discord.js';\nimport ${typeof imports === 'string' ? imports : ('{ ' + imports.join(', ') + ' }')} from '${from}';`);
    }

    public async readContent(): Promise<string> {
        return this.content = await existsAsync(this.filePath) ? await readFile(this.filePath, 'utf-8') : await this.writeContent();
    }

    public async writeContent(): Promise<string> {
        await ConfigReader.createConfigJS(this.filePath);
        return this.readContent();
    }

    public async saveContent(): Promise<string> {
        await writeFile(this.filePath, this.content, 'utf-8');
        return this.content;
    }
}
