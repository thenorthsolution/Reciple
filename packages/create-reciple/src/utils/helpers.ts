import { copyFile, mkdir, readFile, readdir, stat } from 'node:fs/promises';
import { existsAsync } from '@reciple/utils';
import { TemplateJson, TemplateMetadata } from './types.js';
import { kleur } from 'fallout-utility/strings';
import { execSync } from 'node:child_process';
import path from 'node:path';

export async function getTemplates(dir: string): Promise<TemplateMetadata[]> {
    if (!await existsAsync(dir)) {
        await mkdir(dir, { recursive: true });
        return [];
    }

    const templates: TemplateMetadata[] = [];
    const contents = (await readdir(dir)).map(d => path.join(dir, d));

    for (const file of contents) {
        const statData = await stat(file);
        if (!statData.isDirectory()) continue;

        const id = path.basename(file);
        const files = (await readdir(file)).map(d => path.join(file, d));
        if (!files.includes(path.join(file, 'template.json')) || !files.includes(path.join(file, 'package.json'))) continue;

        const metadata: TemplateJson = JSON.parse(await readFile(path.join(file, 'template.json'), 'utf-8'));

        const data: TemplateMetadata = {
            id,
            name: metadata.name,
            language: metadata.language,
            files: files.filter(f => !f.endsWith('template.json')),
            path: file
        };

        templates.push(data);
    }

    return templates;
}

export async function recursiveCopyFiles(from: string, to: string, rename?: (f: string) => string): Promise<void> {
    if ((await stat(from)).isDirectory()) {
        const contents = await readdir(from);

        for (const content of contents) {
            await recursiveCopyFiles(path.join(from, content), path.join(to, rename ? rename(content) : content));
        }

        return;
    }

    if (to.endsWith('template.json')) return;

    await mkdir(path.dirname(to), { recursive: true });
    await copyFile(from, to);
}

export async function runScript(command: string, cwd?: string) {
    console.log(kleur.gray(kleur.bold('$') + ' ' + command));
    try {
        execSync(`${command}`, { cwd, env: { ...process.env, FORCE_COLOR: '1' }, stdio: ['inherit', 'inherit', 'inherit'] });
    } catch(error) {
        process.exit(1);
    }
}

export async function isDirEmpty(dir: string): Promise<boolean> {
    if (!await existsAsync(dir)) return true;

    const contents = (await readdir(dir)).filter(f => !f.startsWith('.'));
    return contents.length === 0;
}
