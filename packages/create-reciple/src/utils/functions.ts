import { copyFileSync, lstatSync, mkdirSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';

export async function runScript(command: string, cwd: string, options?: string[]) {
    execSync(`${command}${options?.length ? (' ' + options.join(' ')) : ''}`, { cwd, env: { ...process.env, FORCE_COLOR: '1' }, stdio: ['inherit', 'inherit', 'inherit'] });
}

export { resolvePackageManager } from '@reciple/utils';


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
