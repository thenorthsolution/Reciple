import { TemplateJson, TemplateMetadata } from './types.js';
import { mkdir, readFile, readdir, stat } from 'node:fs/promises';
import { PackageJson } from 'fallout-utility/types';
import { kleur } from 'fallout-utility/strings';
import path from 'node:path';
import { cancel } from '@clack/prompts';
import { exit } from 'node:process';
import { existsSync } from 'node:fs';
import { packageManagerPlaceholders, packages } from './constants.js';
import { PackageManager } from '@reciple/utils';
import { execSync } from 'node:child_process';

export async function getTemplates(dir: string): Promise<TemplateMetadata[]> {
    if (!existsSync(dir)) {
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
        const packageJson: PackageJson = JSON.parse(await readFile(path.join(file, 'package.json'), 'utf-8'));

        const data: TemplateMetadata = {
            id,
            name: metadata.name,
            language: metadata.language,
            type: packageJson.type ?? "commonjs",
            files: files.filter(f => !f.endsWith('template.json')),
            path: file
        };

        templates.push(data);
    }

    return templates;
}

export function cancelPrompts(options?: { reason?: string; code?: number; }): never {
    cancel(options?.reason ?? 'Operation cancelled');
    exit(options?.code ?? 1);
}

export async function create(template: TemplateMetadata, dir: string, packageManager?: PackageManager): Promise<void> {
    if (!existsSync(dir)) mkdir(dir, { recursive: true });

    await copyFile(template.path, dir, f => f.replace('dot.', '.'));

    let packageJsonData = await readFile(path.join(dir, 'package.json'), 'utf-8');

    const placeholders = packageManagerPlaceholders[packageManager ?? 'npm'];

    for (const pkg of (Object.keys(packages) as (keyof typeof packages)[])) {
        packageJsonData = packageJsonData.replaceAll(pkg, packages[pkg] ?? "*");
    }

    for (const placeholder of (Object.keys(placeholders) as (keyof typeof placeholders)[])) {
        packageJsonData = packageJsonData.replaceAll(placeholder, placeholders[placeholder]);
    }

    if (packageManager) runScript(placeholders['INSTALL_ALL'], dir);

    runScript(`reciple --setup -c reciple.${template.type === 'commonjs' ? 'cjs' : 'mjs'}`);

    console.log(`${kleur.bold(kleur.green('✔') + ' Your project is ready!')}`);
    console.log(`\nStart developing:`);

    if (path.relative(process.cwd(), dir) !== '') {
        console.log(`  • ${kleur.cyan().bold('cd ' + path.relative(process.cwd(), dir))}`);
    }

    if (!packageManager) {
        console.log(`  • ${kleur.cyan().bold(placeholders.INSTALL_ALL)} (or ${packageManagerPlaceholders.pnpm.INSTALL_ALL}, etc)`);
        console.log(`  • ${kleur.cyan().bold(`${placeholders.BIN_EXEC} reciple`)}`);
    }
}

export async function copyFile(from: string, to: string, rename?: (f: string) => string): Promise<void> {
    const isDirectory = (await stat(from)).isDirectory();

    if (isDirectory) {
        const contents = await readdir(from);

        for (const content of contents) {
            await copyFile(path.join(from, content), path.join(to, rename ? rename(content) : content));
        }

        return;
    }

    await mkdir(path.dirname(to), { recursive: true });
    await copyFile(from, to);
}

export async function runScript(command: string, cwd?: string) {
    console.log(kleur.gray(kleur.bold('$') + ' ' + command));
    execSync(`${command}`, { cwd, env: { ...process.env, FORCE_COLOR: '1' }, stdio: ['inherit', 'inherit', 'inherit'] });
}
