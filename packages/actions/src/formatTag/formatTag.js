/**
 * 
 * @param {string} tag 
 * @returns {null|{ package: string; semver: string; }}
 */
export function formatTag(tag) {
	const parsed = /(^@.*\/(?<package>.*)@v?)?(?<semver>\d+.\d+.\d+)-?.*/.exec(tag);

	if (parsed?.groups) {
		return {
			package: parsed.groups.package ?? 'reciple',
			semver: parsed.groups.semver,
		};
	}

	return null;
}
