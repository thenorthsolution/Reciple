import { readFileSync } from 'node:fs';
import path from 'node:path';
import semver from 'semver';

export const realVersion = JSON.parse(readFileSync(path.join(__dirname, '../../package.json'), 'utf-8')).version;
export const version = semver.coerce(realVersion)!.toString();
