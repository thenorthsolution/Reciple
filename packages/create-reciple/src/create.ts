import { copyFileSync, existsSync, lstatSync, mkdirSync, readdirSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '../');

export async function create(cwd: string, templateDir: string): Promise<void> {
    mkdirSync(cwd, { recursive: true });

    copyFile(templateDir, cwd);
    copyFile(path.join(root, 'assets'), cwd, f => f.replace('dot.', '.'));
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
