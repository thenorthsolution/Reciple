export interface APIPartialPackageData {
    _id: string;
    _rev: string;
    name: string;
    'dist-tags': Record<string, string>;
    versions: Record<string, APIPartialPackageVersion>;
    time: Record<string, string>;
    maintainers: { name: string; email: string; }[];
    readme: string;
    readmeFilename: string;
    users: Record<string, boolean>;
    description?: string;
    license?: string;
    homepage?: string;
    keywords?: string[];
    bugs?: string;
}

export interface APIPartialPackageVersion {
    name: string;
    version: string;
    description?: string;
    license?: string;
    homepage?: string;
    keywords?: string[];
    scripts?: Record<string, string>;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    dist: {
        integrity: string;
        shasum: string;
        tarball: string;
        fileCount: number;
        unpackedSize: number;
        signatures: { keyid: string; sig: string; }[];
        'npm-signature': string;
    };
    _npmUser: { name: string; email: string; };
    _npmOperationalInternal: { host: string; tmp: string; };
    _hasShrinkwrap: boolean;
}
