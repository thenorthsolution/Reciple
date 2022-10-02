import semver from 'semver';

/**
 * Current reciple version
 */
export const version = `${semver.coerce(require('../../../package.json').version)}`;

/**
 * Current reciple version from package.json
 */
export const rawVersion = require('../../../package.json').version;

/**
 * Check if the version is valid
 * @param ver Version string to validated
 */
export function isValidVersion(ver: string) {
    return semver.valid(semver.coerce(ver)) !== null;
}

/**
 * Parse the version string
 * @param ver Parse version string
 */
export function parseVersion(ver: string) {
    if (!isValidVersion(ver)) throw new TypeError(`Invalid version: ${ver}`);

    return semver.parse(ver);
}
/**
 * Check if the given version is supported by the given version range
 * @param versionRange Version range
 * @param supportedVersion Version to match given version range
 */
export function isSupportedVersion(versionRange: string, supportedVersion?: string) {
    supportedVersion = supportedVersion || version;

    if (!isValidVersion(versionRange)) throw new TypeError(`Invalid version: ${versionRange}`);
    if (!isValidVersion(supportedVersion)) throw new TypeError(`Invalid supported version: ${supportedVersion}`);

    return semver.satisfies(supportedVersion, versionRange);
}
