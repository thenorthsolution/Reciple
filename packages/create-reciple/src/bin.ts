#!/usr/bin/env node
import { cancel, confirm, group, intro, isCancel, outro, select, text } from '@clack/prompts';
import { PackageManager } from './utils/types.js';
import { dirname, join, resolve } from 'path';
import { create } from './create.js';
import { fileURLToPath } from 'url';
import { exit } from 'process';
import kleur from 'kleur';
import fs from 'fs';
import { resolvePackageManager } from './utils/functions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '../');

const isExplicitDir: boolean = !!process.argv[2];

let cwd = resolve(process.argv[2] || '.');

intro(`${kleur.bold().cyan(`Welcome to Reciple!`)}`);

if (cwd === process.cwd() && !isExplicitDir) {
    const newCwd = await text({
        message: 'Set your project directory (Leave empty to use current dir)',
        placeholder: 'Project directory'
    });

    if (isCancel(newCwd)) { cancel('Operation cancelled'); exit(1); }
    if (newCwd) cwd = newCwd;
}

if (fs.existsSync(cwd)) {
    if (!fs.lstatSync(cwd).isDirectory()) {
        console.log(`${kleur.gray(cwd)} ${kleur.green(`is not a directory`)}`);
        exit(1);
    }

    if (fs.readdirSync(cwd).length > 0) {
        const acceptDir = await confirm({
            message: 'Directory is not empty, would you like to continue?',
            initialValue: false
        });

        if (!acceptDir || isCancel(acceptDir)) { cancel('Operation cancelled'); exit(1); }
    }
}

const setup = await group({
    template: () => select({
        message: 'Which language would you like to use?',
        // @ts-expect-error Idk why
        options: (JSON.parse(fs.readFileSync(join(root, 'templates.json'), 'utf-8')) as { name: string; description: string; dir: string }[]).map(m => ({
            label: m.name,
            value: m.dir,
            hint: m.description
        }))
    }),
    esm: () => confirm({
        message: 'Would you like to use ES Modules? (ES modules uses import instead of require)',
        initialValue: false
    }),
    packageManager: () => select<{ label?: string; hint?: string; value: PackageManager|'none'; }[], PackageManager|'none'>({
        message: 'Select your preferred package manager',
        options: [
            {
                label: 'auto',
                hint: `Use detected package manager: ${resolvePackageManager() || 'none'}`,
                value: resolvePackageManager() || 'none'
            },
            {
                label: 'npm',
                hint: 'Uses npm as package manager',
                value: 'npm'
            },
            {
                label: 'yarn',
                hint: 'Uses yarn as package manager',
                value: 'yarn'
            },
            {
                label: 'pnpm',
                hint: 'Uses pnpm as package manager',
                value: 'pnpm'
            },
            {
                label: 'None',
                hint: 'Setup package manager later',
                value: 'none'
            }
        ]
    }),
}, { onCancel: () => { cancel('Operation cancelled'); exit(1); } });

outro('Setup done!');

create(cwd, join(root, setup.template), setup.esm, setup.packageManager !== 'none' ? setup.packageManager : undefined);
