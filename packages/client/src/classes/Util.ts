import semver from 'semver';
import { AnyCommandBuilder, CommandType } from '..';

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

    public static validateCommandBuilder(command: AnyCommandBuilder): command is AnyCommandBuilder {
        if (!command.name) return false;
        if (command.type === CommandType.MessageCommand && command.options.length && command.options.some(o => !o.name)) return false;
        return true;
    }
}
