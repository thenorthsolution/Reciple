// @ts-check

import { getInput, setOutput } from '@actions/core';
import { readFileSync } from 'fs';
import { globby } from 'globby';
import path from 'path';
import { formatTag } from '../formatTag/formatTag.js';

const pkg = getInput('package', { required: true });
const packages = (await globby(`../../../*/package.json`, { cwd: process.cwd(), onlyFiles: true })).map(p => path.resolve(p));

const pkgJson = packages.map(pkgJsonFile => JSON.parse(readFileSync(pkgJsonFile, 'utf-8'))).map(content => {
    if (!content?.name || !content?.version) return null;
    return formatTag(`${content.name}@${content.version}`);
}).find(p => p?.package == pkg);

if (pkgJson) {
    setOutput('package', pkgJson.package);
    setOutput('semver', pkgJson.semver);
}
