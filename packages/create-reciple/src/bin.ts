#!/usr/bin/env node
import kleur from 'kleur';
import path from 'path';
import fs from 'fs';
import { exit } from 'process';
import { fileURLToPath } from 'url';
import { create } from './create.js';
import { cancel, confirm, group, intro, isCancel, outro, select, text } from '@clack/prompts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '../');

const isExplicitDir: boolean = !!process.argv[2];

let cwd = path.resolve(process.argv[2] || '.');

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
        options: (JSON.parse(fs.readFileSync(path.join(root, 'templates.json'), 'utf-8')) as { name: string; description: string; dir: string }[]).map(m => ({
            label: m.name,
            value: m.dir,
            hint: m.description
        }))
    }),
    esm: () => confirm({
        message: 'Would you like to use ES Modules? (ES modules uses import instead of require)',
        initialValue: false
    }),
    packageManager: () => select({
        message: 'Select your preferred package manager',
        options: [
            {
                label: 'npm',
                hint: 'Uses npm as package manager',
                // @ts-expect-error cries
                value: 'npm'
            },
            {
                label: 'yarn',
                hint: 'Uses yarn as package manager',
                // @ts-expect-error cries
                value: 'yarn'
            },
            {
                label: 'pnpm',
                hint: 'Uses pnpm as package manager',
                // @ts-expect-error cries
                value: 'pnpm'
            },
            {
                label: 'None',
                hint: 'Setup package manager later',
                // @ts-expect-error cries
                value: null
            }
        ]
    }),
}, { onCancel: () => { cancel('Operation cancelled'); exit(1); } });

outro('Setup done!');

create(cwd, path.join(root, setup.template), setup.esm, setup.packageManager);
