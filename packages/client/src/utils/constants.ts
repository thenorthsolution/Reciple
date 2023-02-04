import { readFileSync } from 'fs';
import { path } from 'fallout-utility';
import semver from 'semver';

export const realVersion = JSON.parse(readFileSync(path.join(__dirname, '../../package.json'), 'utf-8')).version;
export const version = `${semver.coerce(realVersion)}`;