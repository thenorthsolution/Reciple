import { DotenvConfigOptions, config } from 'dotenv';
import { RestOrArray, normalizeArray } from 'fallout-utility';

export type PackageManager = 'npm'|'yarn'|'pnpm';

/**
 * Resolve env from string
 * @param str env resolvable string
 * @param envOptions dotenv options
 */
export function resolveEnvProtocol(str: string, envOptions?: DotenvConfigOptions): string|null {
    if (!str.toLowerCase().startsWith('env:')) return str;
    if (envOptions) config(envOptions);

    const variable = str.substring(4);
    return process.env[variable] ?? null;
}

/**
 * Replace index placeholders in a string.
 * @param message The string that contains the placeholders.
 * @param placeholders An array of strings that represent the placeholders.
 */
export function replacePlaceholders(message: string, ...placeholders: RestOrArray<string>) {
    placeholders = normalizeArray(placeholders);

    for (const index in placeholders) {
        message = message.replaceAll(`%${index}%`, placeholders[index]);
    }

    return message;
}

export function resolvePackageManager(): PackageManager|undefined {
	const npmConfigUserAgent = process.env.npm_config_user_agent?.toLowerCase();

	if (!npmConfigUserAgent) return;
	if (npmConfigUserAgent.startsWith('npm')) return 'npm';
	if (npmConfigUserAgent.startsWith('yarn')) return 'yarn';
	if (npmConfigUserAgent.startsWith('pnpm')) return 'pnpm';
}
