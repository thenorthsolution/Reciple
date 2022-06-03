import semver from 'semver';

export const version = require('../../package.json').version as string;
export function validVersion(ver: string) {
    return semver.valid(semver.coerce(ver)) !== null;
}

export function parseVersion(ver: string) {
    if (!validVersion(ver)) throw new TypeError(`Invalid version: ${ver}`);

    const [major, minor, patch] = `${semver.coerce(ver)}`?.split('.') ?? [];
    return { major: parseInt(major), minor: parseInt(minor), patch: parseInt(patch) };
}

export function isSupportedVersion(versionRange: string, supportedVersion?: string) {
    supportedVersion = supportedVersion || version;

    if (!validVersion(versionRange)) throw new TypeError(`Invalid version: ${versionRange}`);
    if (!validVersion(supportedVersion)) throw new TypeError(`Invalid supported version: ${supportedVersion}`);

    return semver.satisfies(supportedVersion, versionRange);
}
