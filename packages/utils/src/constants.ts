export const semverRegex = /^((?:0|(?:[1-9]\d*)))\.((?:0|(?:[1-9]\d*)))\.((?:0|(?:[1-9]\d*)))(?:-([0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*))?$/;

export enum PackageUpdateCheckerUpdateType {
    None,
    Major,
    Minor,
    Patch,
    Prerelease,
    Build
};
