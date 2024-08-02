import { readFile } from 'node:fs/promises';
import { CLI } from '../classes/CLI.js';
import path from 'node:path';
import { Command } from 'commander';
import { Logger } from '@reciple/core';
import { isDebugging } from 'fallout-utility';
import { coerce } from 'semver';
import { PackageUpdateChecker } from '@reciple/utils';

const packageJSON = JSON.parse(await readFile(path.join(CLI.root, './package.json'), 'utf-8'));

export const cliBuildVersion = packageJSON.version;
export const cliVersion = String(coerce(packageJSON.version));

export const logger = new Logger({
    debugmode: {
        enabled: isDebugging(),
        printMessage: false,
        writeToFile: true
    }
});

export const cli = new CLI({
    packageJSON,
    binPath: path.join(CLI.root, './dist/bin.js'),
    commander: new Command(),
    processCwd: process.cwd(),
    logger: logger.clone({
        label: 'CLI'
    }),
    updateChecker: new PackageUpdateChecker({
        packages: []
    })
});
