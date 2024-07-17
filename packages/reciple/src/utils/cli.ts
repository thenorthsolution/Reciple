import { PackageUpdateChecker } from '@reciple/utils';
import { buildVersion } from '@reciple/core';
import { fileURLToPath } from 'node:url';
import { coerce } from 'semver';
import path from 'node:path';
import { CLI } from '../classes/CLI.js';
import { readFile } from 'node:fs/promises';

export const cli = new CLI({
    packageJSON: JSON.parse(await readFile(path.join(path.dirname(fileURLToPath(import.meta.url)), '../../package.json'), 'utf-8')),
    binPath: path.join(path.dirname(fileURLToPath(import.meta.url)), '../bin.js'),
    cwd: process.cwd(),
});

export const command = cli.commander;

global.cli = cli;

export const cliVersion = `${coerce(cli.version)}`;
export const cliBuildVersion = cli.version;
export const updateChecker = new PackageUpdateChecker({
    packages: [
        { package: 'reciple', currentVersion: cliBuildVersion },
        { package: '@reciple/core', currentVersion: buildVersion }
    ]
});
