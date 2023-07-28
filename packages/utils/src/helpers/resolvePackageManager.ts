export type PackageManager = 'npm'|'yarn'|'pnpm';

export function resolvePackageManager(): PackageManager|undefined {
	const npmConfigUserAgent = process.env.npm_config_user_agent?.toLowerCase();

	if (!npmConfigUserAgent) return;
	if (npmConfigUserAgent.startsWith('npm')) return 'npm';
	if (npmConfigUserAgent.startsWith('yarn')) return 'yarn';
	if (npmConfigUserAgent.startsWith('pnpm')) return 'pnpm';
}
