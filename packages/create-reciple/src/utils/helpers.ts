import { copyFile, mkdir, readFile, readdir, stat } from 'node:fs/promises';
import type { TemplateJson, TemplateMetadata } from './types.js';
import { kleur } from 'fallout-utility/strings';
import { execSync } from 'node:child_process';
import { existsAsync } from '@reciple/utils';
import path from 'node:path';

/**
 * Retrieves and returns template metadata from the specified directory.
 *
 * @param {string} dir - The directory path to retrieve templates from.
 * @return {Promise<TemplateMetadata[]>} An array of template metadata objects.
 */
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

/**
 * Recursively copies files from one directory to another.
 *
 * @param {string} from - The source directory path.
 * @param {string} to - The destination directory path.
 * @param {(f: string) => string} [rename] - An optional function to rename files during the copy process.
 * @return {Promise<void>} A promise that resolves when the copy is complete.
 */
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

/**
 * Executes a shell command and logs the command before running it. If the command fails, the process exits with a status code of 1.
 *
 * @param {string} command - The shell command to execute.
 * @param {string} [cwd] - The current working directory in which to execute the command. Defaults to the current working directory.
 * @return {Promise<void>} A promise that resolves when the command has completed.
 */
export async function runScript(command: string, cwd?: string): Promise<void> {
    console.log(kleur.gray(kleur.bold('$') + ' ' + command));
    try {
        execSync(`${command}`, { cwd, env: { ...process.env, FORCE_COLOR: '1' }, stdio: ['inherit', 'inherit', 'inherit'] });
    } catch(error) {
        process.exit(1);
    }
}

/**
 * Checks if a directory is empty by filtering out hidden files.
 *
 * @param {string} dir - The directory path to check.
 * @return {Promise<boolean>} True if the directory is empty, false otherwise.
 */
export async function isDirEmpty(dir: string): Promise<boolean> {
    if (!await existsAsync(dir)) return true;

    const contents = (await readdir(dir)).filter(f => !f.startsWith('.'));
    return contents.length === 0;
}
