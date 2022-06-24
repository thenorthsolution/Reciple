import semver from 'semver';


export const version = require('../../package.json').version as string;

export function isValidVersion(ver: string) {
    return semver.valid(semver.coerce(ver)) !== null;
}

export function parseVersion(ver: string) {
    if (!isValidVersion(ver)) throw new TypeError(`Invalid version: ${ver}`);

    const [major, minor, patch] = `${semver.coerce(ver)}`?.split('.') ?? [];
    return { major: parseInt(major), minor: parseInt(minor), patch: parseInt(patch) };
}

export function isSupportedVersion(versionRange: string, supportedVersion?: string) {
    supportedVersion = supportedVersion || version;

    if (!isValidVersion(versionRange)) throw new TypeError(`Invalid version: ${versionRange}`);
    if (!isValidVersion(supportedVersion)) throw new TypeError(`Invalid supported version: ${supportedVersion}`);

    return semver.satisfies(supportedVersion, versionRange);
}
