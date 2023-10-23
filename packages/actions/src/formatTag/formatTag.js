// @ts-check

/**
 * 
 * @param {string} tag 
 * @returns {null|{ package: string; semver: string; }}
 */
export function formatTag(tag) {
	const parsed = /(?:^@.*\/(?<package>.*)@v?)?(?<semver>\d+.\d+.\d+)-?.*/.exec(tag);
	const parsedPackage = /(?<package>.*)@v?-?.*/.exec(tag);

	if (parsed?.groups) {
        const isSubpackage = typeof parsed.groups.package === 'string';

		return {
			package: (isSubpackage ? parsed.groups.package : parsedPackage?.groups?.package) ?? 'reciple',
			semver: parsed.groups.semver,
		};
	}

	return null;
}
