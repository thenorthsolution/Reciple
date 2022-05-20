import { isNumber } from 'fallout-utility';

export const version = require('../../package.json').version as string;
export function validVersion(ver: string) {
    if (!ver || typeof ver !== 'string' || ver.split('.').length < 3) return false;

    const [major, minor, patch] = ver.split('.');
    if (!isNumber(major) || !isNumber(minor) || !isNumber(patch)) return false;

    return true;
}

export function parseVersion(ver: string) {
    if (!validVersion(ver)) throw new TypeError(`Invalid version: ${ver}`);

    const [major, minor, patch] = ver.split('.');
    return { major: parseInt(major), minor: parseInt(minor), patch: parseInt(patch) };
}

export function isSupportedVersion(ver: string, supportedVersion?: string) {
    supportedVersion = supportedVersion || version;

    if (!validVersion(ver)) throw new TypeError(`Invalid version: ${ver}`);
    if (!validVersion(supportedVersion)) throw new TypeError(`Invalid supported version: ${supportedVersion}`);

    const { major, minor, patch } = parseVersion(ver);
    const { major: supportedMajor, minor: supportedMinor, patch: supportedPatch } = parseVersion(supportedVersion);

    if (major !== supportedMajor) return false;

    if (minor > supportedMinor) return true;
    if (minor < supportedMinor) return false;

    if (patch > supportedPatch) return true;
    if (patch < supportedPatch) return false;

    return true;
}
