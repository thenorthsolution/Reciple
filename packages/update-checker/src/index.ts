import type { AbbreviatedMetadata, FullMetadataOptions, Options } from './types/types.js';
import { SemVer, satisfies } from 'semver';

export type { AbbreviatedMetadata, FullMetadataOptions, Options } from './types/types.js';

export enum UpdateType {
    None,
    Major,
    Minor,
    Patch,
    Prerelease,
    Build
}

export interface UpdateData {
    package: string;
    data: AbbreviatedMetadata;
    updateType: UpdateType;
    currentVersion: string;
    updatedVersion: string;
}

export async function fetchPackageData<T extends AbbreviatedMetadata = AbbreviatedMetadata>(pkg: string, options?: Options): Promise<T>;
export async function fetchPackageData<T extends FullMetadataOptions = FullMetadataOptions>(pkg: string, options?: FullMetadataOptions): Promise<T>;
export async function fetchPackageData<T extends FullMetadataOptions|AbbreviatedMetadata = FullMetadataOptions|AbbreviatedMetadata>(pkg: string, options?: FullMetadataOptions|Options): Promise<T> {
    return (await import('package-json')).default(pkg, options ?? { allVersions: true }) as Promise<T>;
}

export async function checkLatestUpdate(pkg: string, version: string, allowMajor: boolean = false): Promise<UpdateData> {
    const currentSemver = new SemVer(version);

    const updateData = await fetchPackageData(pkg);
    const versions = Object.keys(updateData.versions).filter(v => !v.includes('-') && (allowMajor || satisfies(v, `^${currentSemver.version}`))) ?? [];
    const latest = versions.length && versions[versions.length - 1] ? new SemVer(versions[versions.length - 1]) : null;

    if (!latest) throw new Error(`Unable to find any version of '${pkg}' that satisfies ^${currentSemver.version}`);

    const response: UpdateData = {
        package: pkg,
        data: updateData,
        currentVersion: currentSemver.format(),
        updatedVersion: latest.format(),
        updateType: UpdateType.None
    };

    if (currentSemver.version === latest.version) return response;
    if (latest.compareBuild(currentSemver) === 1) response.updateType = UpdateType.Build;
    if (latest.comparePre(currentSemver) === 1) response.updateType = UpdateType.Prerelease;
    if (currentSemver.patch !== latest.patch) response.updateType = UpdateType.Patch;
    if (currentSemver.minor !== latest.minor) response.updateType = UpdateType.Minor;
    if (currentSemver.major !== latest.major) response.updateType = UpdateType.Major;

    return response;
}
