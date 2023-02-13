#!/usr/bin/env node
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import prompts from 'prompts';
import { exit } from 'process';
import { fileURLToPath } from 'url';
import { create } from './create.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '../');

const { version } = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'));

console.log(`${chalk.bold.cyan(`Welcome to Reciple!`)}`);
console.log(`${chalk.gray(`create-reciple version `+ chalk.green(version))}`);

let cwd = process.argv[2] || '.';

if (cwd === '.') {
    const opts = await prompts({
        name: 'cwd',
        type: 'text',
        message: 'Set your project directory (Leave empty to use current dir)'
    });

    if (opts.cwd) cwd = opts.cwd;
}

cwd = path.resolve(cwd);

if (fs.existsSync(cwd)) {
    if (!fs.lstatSync(cwd).isDirectory()) {
        console.log(`${chalk.gray(cwd)} ${chalk.green(`is not a directory`)}`);
        exit(1);
    }

    if (fs.readdirSync(cwd).length > 0) {
        const opts = await prompts({
                name: 'confirm',
                type: 'confirm',
                message: 'Directory is not empty, would you like to continue?',
                initial: false
        });

        if (!opts.confirm) exit(1);
    }
}

const setup = await prompts([
    {
        name: 'template',
        type: 'select',
        message: 'Which language would you like to use?',
        choices: (JSON.parse(fs.readFileSync(path.join(root, 'templates.json'), 'utf-8')) as { name: string; description: string; dir: string }[])
            .map(m => ({ title: m.name, description: m.description, value: m.dir })),
    },
    {
        name: 'esm',
        type: 'confirm',
        message: 'Would u like to use ES Modules? (ES modules uses import instead of require)',
        initial: false
    },
], { onCancel: () => exit() });


create(cwd, path.join(root, setup.template), setup.esm);
