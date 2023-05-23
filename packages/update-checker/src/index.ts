import { SemVer, satisfies } from 'semver';
import { APIPartialPackageData } from './types/npmTypes';
import axios from 'axios';

export * from './types/npmTypes';

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
    updateType: UpdateType;
    currentVersion: string;
    updatedVersion: string;
};

export async function fetchPackageData<T extends APIPartialPackageData = APIPartialPackageData>(pkg: string): Promise<T> {
    return axios.get<T>(`https://registry.npmjs.org/${pkg}`, { responseType: 'json' }).then(d => d.data);
}

export async function checkLatestUpdate(pkg: string, version: string, allowMajor: boolean = false): Promise<UpdateData> {
    const currentSemver = new SemVer(version);

    const updateData = await fetchPackageData(pkg);
    const versions = Object.keys(updateData.versions).filter(v => !v.includes('-') && (allowMajor || satisfies(v, `^${currentSemver.version}`))) ?? [];
    const latest = versions.length && versions[versions.length - 1] ? new SemVer(versions[versions.length - 1]) : null;

    if (!latest) throw new Error(`Unable to find any version of '${pkg}' that satisfies ^${currentSemver.version}`);

    const response: UpdateData = {
        package: pkg,
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
