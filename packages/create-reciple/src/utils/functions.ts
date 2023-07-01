import { copyFileSync, lstatSync, mkdirSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { PackageManager } from './types.js';
import { dirname, join } from 'node:path';

export async function runScript(command: string, cwd: string, options?: string[]) {
    execSync(`${command}${options?.length ? (' ' + options.join(' ')) : ''}`, { cwd, env: { ...process.env, FORCE_COLOR: '1' }, stdio: ['inherit', 'inherit', 'inherit'] });
}

export function resolvePackageManager(): PackageManager|undefined {
	const npmConfigUserAgent = process.env.npm_config_user_agent;

	if (!npmConfigUserAgent) return;

	if (npmConfigUserAgent.startsWith('npm')) {
		return 'npm';
	}

	if (npmConfigUserAgent.startsWith('yarn')) {
		return 'yarn';
	}

	if (npmConfigUserAgent.startsWith('pnpm')) {
		return 'pnpm';
	}
}


export function copyFile(from: string, to: string, rename?: (f: string) => string): void {
    const isDirectory = lstatSync(from).isDirectory();

    if (isDirectory) {
        const contents = readdirSync(from);

        for (const content of contents) {
            copyFile(join(from, content), join(to, rename ? rename(content) : content));
        }

        return;
    }

    mkdirSync(dirname(to), { recursive: true });
    copyFileSync(from, to);
}
