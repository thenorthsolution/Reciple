import type { PackageJson } from 'fallout-utility/types';
import type { PackageManager } from '@reciple/utils';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../');
export const templatesFolder = path.join(root, 'templates');
export const packageJson: PackageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf-8'));
export const newLineRegex = /\r\n|\r|\n/g;

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
        label: 'bun',
        hint: 'Uses bun as package manager',
        value: 'bun'
    },
    {
        label: 'none',
        hint: 'Setup package manager later',
        value: 'none'
    }
];

export const packages: Record<string, string> = {
    'TYPES_NODE': packageJson.devDependencies!['@types/node']!,
    'RECIPLE_CORE': packageJson.dependencies!['@reciple/core']!,
    'RECIPLE_DECORATORS': packageJson.dependencies!['@reciple/decorators']!,
    'TYPESCRIPT': packageJson.devDependencies!['typescript']!,
    'RIMRAF': packageJson.devDependencies!['rimraf']!,
    'RECIPLE': packageJson.dependencies!['reciple']!,
    'DISCORDJS': packageJson.dependencies!['discord.js']!,
    'NODEMON': packageJson.devDependencies!['nodemon']!
};

export const packageManagerPlaceholders: Record<PackageManager, Record<'SCRIPT_RUN'|'BIN_EXEC'|'INSTALL_ALL'|'INSTALL_PKG'|'UNINSTALL_PKG', string>> = {
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
    },
    'bun': {
        'SCRIPT_RUN': 'bun run',
        'BIN_EXEC': 'bunx',
        'INSTALL_ALL': 'bun install',
        'INSTALL_PKG': 'bun add',
        'UNINSTALL_PKG': 'bun remove'
    }
};
