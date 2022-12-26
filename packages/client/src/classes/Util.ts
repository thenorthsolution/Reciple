import semver from 'semver';

export class Util {
    static get rawVersion(): string {
        return require('../../package.json').version;
    }

    static get version(): string {
        return `${semver.coerce(this.rawVersion)}`;
    }

    static isValidVersion(version: string) {
        return semver.valid(semver.coerce(version)) !== null;
    }

    static isSupportedVersion(versionRange: string, version?: string) {
        version = version || this.version;

        if (!this.isValidVersion(versionRange)) throw new TypeError(`Invalid version: ${versionRange}`);
        if (!this.isValidVersion(version)) throw new TypeError(`Invalid supported version: ${version}`);

        return semver.satisfies(version, versionRange);
    }
}
