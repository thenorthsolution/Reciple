import { AbbreviatedMetadata, FullMetadata, Options } from '../types/types.js';
import { PackageUpdateType } from '../constants.js';
import packageJson from 'package-json';
import { satisfies, SemVer } from 'semver';
import { Collection } from '@discordjs/collection';
import { StrictTypedEmitter } from 'fallout-utility/StrictTypedEmitter';

export interface PackageUpdateCheckerOptions {
    packages: { package: string; currentVersion: string; }[];
    updatecheckIntervalMs?: number;
}

export interface PackageUpdateCheckerEvents {
    updateAvailable: [data: PackageUpdateCheckerUpdateData];
    updateError: [pkg: string, error: unknown];
}

export interface PackageUpdateCheckerUpdateData {
    /**
     * A string representing the name of the package.
     */
    package: string;
    /**
     * Package metadata from the registry
     */
    data: AbbreviatedMetadata;
    /**
     *  It could be major, minor, or patch, which typically represent changes to the package that are incompatible, backward-compatible, or fully backward-compatible with the previous version, respectively.
     */
    updateType: PackageUpdateType;
    /**
     * This property is a string that represents the current version of the package before the update.
     */
    currentVersion: string;
    /**
     * This property is also a string that represents the version of the package after it has been updated.
     */
    updatedVersion: string;
    /**
     * This property is a string that represents the latest available version of the package at the time of the update check.
     */
    latestVersion: string;
}

export class PackageUpdateChecker extends StrictTypedEmitter<PackageUpdateCheckerEvents> {
    public packages: Collection<string, string> = new Collection();
    public interval?: NodeJS.Timeout;

    constructor(options: PackageUpdateCheckerOptions) {
        super();

        for (const pkg of options.packages) {
            this.packages.set(pkg.package, pkg.currentVersion);
        }

        if (options.updatecheckIntervalMs) this.startCheckInterval(options.updatecheckIntervalMs);
    }

    public startCheckInterval(ms?: number): void {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }

        if (ms) this.interval = setInterval(() => this.checkForAvailableUpdates(), ms).unref();
    }

    public stopCheckInterval(): void {
        this.startCheckInterval(0);
    }

    public async checkForAvailableUpdates(): Promise<PackageUpdateCheckerUpdateData[]> {
        const packageUpdates: PackageUpdateCheckerUpdateData[] = [];

        await Promise.all(this.packages.map(async (currentVersion, pkg) => {
            try {
                const data = await PackageUpdateChecker.checkLatestUpdate(pkg, currentVersion);
                if (!data.updateType) return;

                packageUpdates.push(data);
                this.emit('updateAvailable', data);
            } catch (err) {
                this.emit('updateError', pkg, err);
            }
        }));

        return packageUpdates;
    }

    public static async checkLatestUpdate(pkg: string, version: string, allowMajor: boolean = false): Promise<PackageUpdateCheckerUpdateData> {
        const currentSemver = new SemVer(version);

        const updateData = await this.fetchPackageData(pkg);
        const versions = Object.keys(updateData.versions).filter(v => !v.includes('-') && (allowMajor || satisfies(v, `^${currentSemver.version}`))) ?? [];
        const latest = versions.length && versions[versions.length - 1] ? new SemVer(versions[versions.length - 1]) : null;

        if (!latest) throw new Error(`Unable to find any version of '${pkg}' that satisfies ^${currentSemver.version}`);

        const response: PackageUpdateCheckerUpdateData = {
            package: pkg,
            data: updateData,
            currentVersion: currentSemver.format(),
            updatedVersion: latest.format(),
            latestVersion: updateData['dist-tags'].latest,
            updateType: PackageUpdateType.None
        };

        if (currentSemver.version === latest.version) return response;
        if (latest.compareBuild(currentSemver) === 1) response.updateType = PackageUpdateType.Build;
        if (latest.comparePre(currentSemver) === 1) response.updateType = PackageUpdateType.Prerelease;
        if (currentSemver.patch !== latest.patch) response.updateType = PackageUpdateType.Patch;
        if (currentSemver.minor !== latest.minor) response.updateType = PackageUpdateType.Minor;
        if (currentSemver.major !== latest.major) response.updateType = PackageUpdateType.Major;

        return response;
    }

    public static async fetchPackageData<T extends AbbreviatedMetadata = AbbreviatedMetadata>(pkg: string, options?: Options): Promise<T>;
    public static async fetchPackageData<T extends FullMetadata = FullMetadata>(pkg: string, options?: FullMetadata): Promise<T>;
    public static async fetchPackageData<T extends FullMetadata|AbbreviatedMetadata = FullMetadata|AbbreviatedMetadata>(pkg: string, options?: FullMetadata|Options): Promise<T> {
        return packageJson(pkg, { ...options, allVersions: true }) as Promise<T>;
    }
}

export { AbbreviatedMetadata, FullMetadata };
