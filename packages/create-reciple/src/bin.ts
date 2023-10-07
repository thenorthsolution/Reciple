import { packageJson, packageManagers, templatesFolder } from './utils/constants.js';
import { cancelPrompts, create, getTemplates } from './utils/helpers.js';
import { PackageManager, resolvePackageManager } from '@reciple/utils';
import { CliOptions } from './utils/types.js';
import { confirm, intro, isCancel, outro, select, text } from '@clack/prompts';
import { Command } from 'commander';
import path from 'path';
import { existsSync, statSync } from 'fs';

const command = new Command()
    .name(packageJson.name!)
    .description(packageJson.description!)
    .version(packageJson.version!, '-v, --version')
    .argument('[dir]', 'Create template in this folder')
    .option('--typescript', 'Use typescript templates', 'null')
    .option('--commonjs', 'Use commonjs templates', 'null')
    .option('--package-manager <npm,yarn,pnpm>', 'Set package manager', 'null');

command.parse(process.argv);

const options = command.opts<CliOptions>();
const templates = await getTemplates(templatesFolder);

let dir: string|null = command.args[0] ?? null;
let typescript: boolean|null = options.typescript !== 'null' ? options.typescript : null;
let commonjs: boolean|null = options.commonjs !== 'null' ? options.commonjs : null;
let packageManager: PackageManager|null = options.packageManager !== 'null' ? options.packageManager : null;

if (dir === null || typescript === null || commonjs === null || packageManager === null) {
    intro(`${packageJson.name} v${packageJson.version}`);

    if (dir === null) {
        const newDir = await text({
            message: `Enter project directory`,
            placeholder: `Leave empty to use current directory`,
            defaultValue: process.cwd(),
            validate: value => {
                const dir = path.resolve(value);

                if (!existsSync(dir)) return;
                if (!statSync(dir).isDirectory()) return 'Invalid folder directory';
            }
        });

        if (isCancel(newDir)) cancelPrompts();
        dir = newDir;
    }

    if (typescript === null) {
        const isTypescript = await confirm({
            message: `Would you like to use typescript?`,
            active: `Yes`,
            inactive: `No`
        });

        if (isCancel(isTypescript)) cancelPrompts();
        typescript = isTypescript;
    }

    if (commonjs === null) {
        const isESM = await confirm({
            message: `Would you like to use ES Modules? (uses import() instead of require())`,
            initialValue: true,
            active: `Yes`,
            inactive: `No`
        });

        if (isCancel(isESM)) cancelPrompts();
        commonjs = !isESM;
    }

    if (packageManager === null) {
        const resolvedPackageManager = resolvePackageManager();
        let firstPackageManagerIndex = packageManagers.findIndex(p => resolvedPackageManager && resolvedPackageManager === p.value);
            firstPackageManagerIndex = firstPackageManagerIndex === -1 ? packageManagers.length - 1 : firstPackageManagerIndex;

        const newPackageManager = await select<{ label?: string; hint?: string; value: PackageManager|'none'; }[], PackageManager|'none'>({
            message: 'Select your preferred package manager',
            options: [
                packageManagers[firstPackageManagerIndex],
                ...packageManagers.filter((p, i) => i !== firstPackageManagerIndex)
            ]
        });

        if (isCancel(newPackageManager)) cancelPrompts();
        packageManager = newPackageManager !== 'none' ? newPackageManager : null;
    }
}

dir = path.resolve(dir);

const template = templates.find(p => (commonjs && p.type === 'commonjs') && (typescript && p.language === 'Typescript'));
if (!template) cancelPrompts({ reason: `Template not found` });

outro(`Setup Done! Creating from "${template.name}" template`);
await create(template, dir, packageManager ?? undefined);
