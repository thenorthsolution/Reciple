import { readFile, writeFile } from 'node:fs/promises';
import detectIndentSize from 'detect-indent';
import { existsAsync } from '@reciple/utils';
import { Config as ConfigReader } from 'reciple';
import path from 'node:path';

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

    public async setup(options?: Partial<Record<'halts'|'preconditions', { class: string; notDefault?: boolean; from: string; }[]>>): Promise<this> {
        await this.readContent();

        if (options?.preconditions?.length) this.addPreconditions(options.preconditions);
        if (options?.halts?.length) this.addHalts(options.halts);

        await this.saveContent();
        return this;
    }

    public addPreconditions(preconditions: { class: string; notDefault?: boolean; from: string; }[]): void {
        preconditions = preconditions.filter(precondition => !this.content.includes(`new ${precondition.class}()`));

        this.content = this.content.replaceAll(`new CommandPermissionsPrecondition()`, `new CommandPermissionsPrecondition(),\n${this.indent.repeat(2)}${preconditions.map(precondition => `new ${precondition.class}(),`).join('\n' + this.indent.repeat(2))}`);

        for (const precondition of preconditions) {
            this.addImport(precondition.notDefault !== true ? [precondition.class] : precondition.class, precondition.from);
        }
    }

    public addHalts(halts: { class: string; notDefault?: boolean; from: string; }[]): void {
        halts = halts.filter(halt => !this.content.includes(`new ${halt.class}()`));

        this.content = this.content.replaceAll(`commandHalts: []`, `commandHalts: [\n${this.indent.repeat(2)}${halts.map(halt => `new ${halt.class}(),`).join('\n' + this.indent.repeat(2))}\n${this.indent}]`);

        for (const halt of halts) {
            this.addImport(halt.notDefault !== true ? [halt.class] : halt.class, halt.from);
        }
    }

    public addImport(imports: string|string[], from: string): void {
        const importString = `import ${typeof imports === 'string' ? imports : ('{ ' + imports.join(', ') + ' }')} from '${from}';`;
        if (this.content.includes(importString)) return;

        this.content = this.content.replace(`import { IntentsBitField } from 'discord.js';`, `import { IntentsBitField } from 'discord.js';\n${importString}`);
    }

    public async readContent(): Promise<string> {
        return this.content = await existsAsync(this.filePath) ? await readFile(this.filePath, 'utf-8') : await this.writeContent();
    }

    public async writeContent(): Promise<string> {
        await ConfigReader.createConfigFile(this.filePath);
        return this.readContent();
    }

    public async saveContent(): Promise<string> {
        await writeFile(this.filePath, this.content, 'utf-8');
        return this.content;
    }
}
