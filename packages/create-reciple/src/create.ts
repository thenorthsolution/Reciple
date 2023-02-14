import { ChildProcess, spawn } from 'child_process';
import { copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '../');

export async function create(cwd: string, templateDir: string, esm: boolean, pm?: 'npm'|'yarn'|'pnpm'): Promise<void> {
    if (esm) templateDir = templateDir + `-esm`;
    if (!existsSync(templateDir)) return;

    mkdirSync(cwd, { recursive: true });

    copyFile(templateDir, cwd, f => f.replace('dot.', '.'));

    if (existsSync(path.join(root, 'assets'))) {
        copyFile(path.join(root, 'assets'), cwd, f => f.replace('dot.', '.'));
    }

    const { devDependencies } = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf-8'));

    let packageJSON = readFileSync(path.join(cwd, 'package.json'), 'utf-8');

    packageJSON = packageJSON.replace('RECIPLE', devDependencies.reciple);
    packageJSON = packageJSON.replace('DISCORDJS', devDependencies['discord.js']);

    writeFileSync(path.join(cwd, 'package.json'), packageJSON);

    if (!pm) return;

    await runScript(pm, cwd, ['install']);

    if (templateDir.includes(`typescript`)) await runScript(pm, cwd, ['run', 'build']);
    await runScript('npx', cwd, ['reciple', '-y']);
}


export function copyFile(from: string, to: string, rename?: (f: string) => string): void {
    const isDirectory = lstatSync(from).isDirectory();

    if (isDirectory) {
        const contents = readdirSync(from);

        for (const content of contents) {
            copyFile(path.join(from, content), path.join(to, rename ? rename(content) : content));
        }

        return;
    }

    mkdirSync(path.dirname(to), { recursive: true });
    copyFileSync(from, to);
}


export function runScript(command: string, cwd: string, options?: string[]) {
    const child: ChildProcess = spawn(command, options ?? [], { cwd, shell: true, env: { ...process.env, FORCE_COLOR: '1' }, stdio: ['inherit', 'inherit', 'inherit'] });

    child.stdout?.pipe(process.stdout);
    child.stderr?.pipe(process.stderr);

    if (child.stdin) process.stdin.pipe(child.stdin);

    return new Promise((res) => child.on('close', () => res(void 0)));
}
