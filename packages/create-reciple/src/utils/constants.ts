import { PackageJson } from 'fallout-utility/types';
import { PackageManager } from '@reciple/utils';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../');
export const templatesFolder = path.join(root, 'templates');
export const packageJson: PackageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf-8'));

export const packageManagers: { label?: string; hint?: string; value: PackageManager|'none'; }[] = [
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
        label: 'none',
        hint: 'Setup package manager later',
        value: 'none'
    }
];

export const packages = {
    'TYPES_NODE': packageJson.devDependencies!['@types/node'],
    'RECIPLE_CORE': packageJson.devDependencies!['@reciple/core'],
    'TYPESCRIPT': packageJson.devDependencies!['typescript'],
    'RIMRAF': packageJson.devDependencies!['rimraf'],
    'RECIPLE': packageJson.devDependencies!['reciple'],
    'DISCORDJS': packageJson.devDependencies!['discord.js'],
    'NODEMON': packageJson.devDependencies!['nodemon']
};

export const packageManagerPlaceholders = {
    'npm': {
        'SCRIPT_RUN': 'npm run',
        'BIN_EXEC': 'npx',
        'INSTALL_ALL': 'npm install',
        'INSTALL_PKG': 'npm install',
        'UNINSTALL_PKG': 'npm uninstall'
    },
    'pnpm': {
        'SCRIPT_RUN': 'pnpm run',
        'BIN_EXEC': 'pnpm exec',
        'INSTALL_ALL': 'pnpm install',
        'INSTALL_PKG': 'pnpm add',
        'UNINSTALL_PKG': 'pnpm remove'
    },
    'yarn': {
        'SCRIPT_RUN': 'yarn run',
        'BIN_EXEC': 'yarn exec',
        'INSTALL_ALL': 'yarn',
        'INSTALL_PKG': 'yarn add',
        'UNINSTALL_PKG': 'yarn remove'
    }
};

