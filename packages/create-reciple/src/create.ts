import { copyFile, resolvePackageManager, runScript } from './utils/functions.js';
import { packageManagerPlaceholders, packages, root } from './utils/constants.js';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { PackageManager } from './utils/types.js';
import { join, relative } from 'path';
import kleur from 'kleur';

export async function create(cwd: string, templateDir: string, esm: boolean, pm?: PackageManager): Promise<void> {
    if (esm) templateDir = templateDir + `-esm`;
    if (!existsSync(templateDir)) return;

    mkdirSync(cwd, { recursive: true });

    copyFile(templateDir, cwd, f => f.replace('dot.', '.'));

    if (existsSync(join(root, 'assets'))) {
        copyFile(join(root, 'assets'), cwd, f => f.replace('dot.', '.'));
    }

    let rawPackageJSON = readFileSync(join(cwd, 'package.json'), 'utf-8');
    const detectedPackageManager = resolvePackageManager();

    const placeholders = packageManagerPlaceholders[pm ?? detectedPackageManager ?? 'npm'];

    for (const pkg of (Object.keys(packages) as (keyof typeof packages)[])) {
        rawPackageJSON = rawPackageJSON.replaceAll(pkg, packages[pkg]);
    }

    for (const placeholder of (Object.keys(placeholders) as (keyof typeof placeholders)[])) {
        rawPackageJSON = rawPackageJSON.replaceAll(placeholder, placeholders[placeholder]);
    }

    writeFileSync(join(cwd, 'package.json'), rawPackageJSON);

    if (pm) {
        await runScript(placeholders.INSTALL_ALL, cwd);

        if (templateDir.includes(`typescript`)) await runScript(`${placeholders.SCRIPT_RUN} build`, cwd);
        await runScript(`${placeholders.BIN_EXEC} reciple -y --setup`, cwd);
    }

    console.log(`${kleur.bold(kleur.green('✔') + ' Your project is ready!')}`);
    console.log(`\nStart developing:`);

    if (relative(process.cwd(), cwd) !== '') {
        console.log(`  • ${kleur.cyan().bold('cd ' + relative(process.cwd(), cwd))}`);
    }

    if (!pm) {
        console.log(`  • ${kleur.cyan().bold(placeholders.INSTALL_ALL)} (or ${packageManagerPlaceholders.pnpm.INSTALL_ALL}, etc)`);
        console.log(`  • ${kleur.cyan().bold(`${placeholders.BIN_EXEC} reciple --setup`)}`);
    }

    console.log(`  • ${kleur.cyan().bold(`${placeholders.SCRIPT_RUN} dev`)}`);

    console.log(`\nTo close the bot process, press ${kleur.cyan().bold(`Ctrl + C`)}`)
}
