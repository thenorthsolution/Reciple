// @ts-check

import { getInput, setOutput } from '@actions/core';
import { readFileSync } from 'fs';
import { globby } from 'globby';
import path from 'path';
import { formatTag } from '../formatTag/formatTag.js';

const pkg = getInput('package', { required: true });
const packages = (await globby(`../../../*/package.json`, { cwd: process.cwd(), onlyFiles: true })).map(p => path.resolve(p));

console.log(`All packages:\n`, packages.join('\n'));

const pkgJson = packages.map(pkgJsonFile => JSON.parse(readFileSync(pkgJsonFile, 'utf-8'))).map(content => {
    if (!content?.name || !content?.version) return null;
    return formatTag(`${content.name}@${content.version}`);
}).find(p => p?.package == pkg);

console.log(`Output:\n`, pkgJson);

if (pkgJson) {
    setOutput('package', pkgJson.package);
    setOutput('semver', pkgJson.semver);
}
