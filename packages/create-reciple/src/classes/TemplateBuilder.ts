import { existsAsync } from '@reciple/utils';
import { TemplateMetadata } from '../utils/types.js';
import { SetupOptions } from './Setup.js';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { recursiveCopyFiles, runScript } from '../utils/helpers.js';
import path from 'path';
import { packageManagerPlaceholders, packages, root } from '../utils/constants.js';
import { Addon } from './Addon.js';
import detectIndent from 'detect-indent';
import { kleur, PackageJson } from 'fallout-utility';
import { ConfigReader, RecipleConfig } from 'reciple';
import ora, { Ora, PersistOptions } from 'ora';

export interface TemplateBuilderOptions {
    setup: SetupOptions;
    template: TemplateMetadata;
}

export class TemplateBuilder implements TemplateBuilderOptions {
    public setup: SetupOptions;
    public template: TemplateMetadata;

    public config?: RecipleConfig;
    public spinner?: Ora;

    get dir() {
        return this.setup.dir ?? process.cwd();
    }

    get packageJsonPath() {
        return path.join(this.dir, 'package.json');
    }

    get packageManagerPlaceholders() {
        return packageManagerPlaceholders[this.setup.packageManager ?? 'npm'];
    }

    constructor(options: TemplateBuilderOptions) {
        this.setup = options.setup;
        this.template = options.template;
    }

    public async build(): Promise<void> {
        this.spinner = ora({
            text: '',
            color: 'cyan',
            spinner: 'dots'
        });

        if (!await existsAsync(this.dir)) await mkdir(this.dir, { recursive: true });

        await this.copyTemplateFiles();
        await this.copyAssets();
        await this.setupPackageJson();
        await this.setupConfig();
        await this.setupAddons();
        await this.setupEnv();

        this.spinner.succeed('Template build successful.');

        if (this.setup.packageManager) await this.installDependencies();

        console.log(`${kleur.bold(kleur.green('✔') + ' Your project is ready!')}`);
        console.log(`\nStart developing:`);

        if (path.relative(process.cwd(), this.dir) !== '') {
            console.log(`  • ${kleur.cyan().bold('cd ' + path.relative(process.cwd(), this.dir))}`);
        }

        if (!this.setup.packageManager) console.log(`  • ${kleur.cyan().bold(this.packageManagerPlaceholders.INSTALL_ALL)} (or ${packageManagerPlaceholders.pnpm.INSTALL_ALL}, etc)`);

        console.log(`  • ${kleur.cyan().bold(`${this.packageManagerPlaceholders.SCRIPT_RUN} dev`)}`);
    }

    public async copyTemplateFiles(): Promise<void> {
        this.setSpinnerText('Copying template files...');
        await recursiveCopyFiles(this.template.path, this.dir, f => f.replace('dot.', '.'));
        this.persistSpinner({ symbol: kleur.bold().green('✔'), text: 'Template files copied.' });
    }

    public async copyAssets(): Promise<void> {
        this.setSpinnerText('Copying asset files...');

        if (await existsAsync(path.join(root, 'assets'))) {
            await recursiveCopyFiles(path.join(root, 'assets'), this.dir, f => f.replace('dot.', '.'));
        }

        this.persistSpinner({ symbol: kleur.bold().green('✔'), text: 'Copied all assets.' });
    }

    public async setupPackageJson(): Promise<void> {
        this.setSpinnerText(`Configuring ${kleur.green('package.json')} package versions...`);

        let packageJson = await readFile(this.packageJsonPath, 'utf-8');

        for (const pkg of (Object.keys(packages) as (keyof typeof packages)[])) {
            packageJson = packageJson.replaceAll(`"${pkg}"`, `"${packages[pkg] ?? "*"}"`);
        }


        this.setSpinnerText(`Configuring ${kleur.green('package.json')} scripts...`);

        for (const placeholder of (Object.keys(this.packageManagerPlaceholders) as (keyof typeof this.packageManagerPlaceholders)[])) {
            packageJson = packageJson.replaceAll(placeholder, this.packageManagerPlaceholders[placeholder]);
        }

        await writeFile(this.packageJsonPath, packageJson, 'utf-8');
        this.persistSpinner({ symbol: kleur.bold().green('✔'), text: `${kleur.green('package.json')} configured.` });
    }

    public async setupConfig(): Promise<void> {
        this.setSpinnerText(`Configuring ${kleur.green('reciple.mjs')}...`);
        await ConfigReader.createConfigJS(path.join(this.dir, 'reciple.mjs'));
        this.persistSpinner({ symbol: kleur.bold().green('✔'), text: `${kleur.green('reciple.mjs')} configured.` });
    }

    public async setupAddons(): Promise<void> {
        const addons = (this.setup.addons ?? []).map(a => new Addon({ module: a, version: Addon.DEFAULT_ADDON_VERSIONS[a as keyof typeof Addon.DEFAULT_ADDON_VERSIONS] || undefined }));
        if (!addons.length) return;

        this.setSpinnerText(`Installing ${kleur.cyan(addons.length + ' addons')} ${kleur.gray('(0/'+ addons.length +')')}...`);

        let packageJsonData = await readFile(this.packageJsonPath, 'utf-8');
        let packageJson = JSON.parse(packageJsonData) as PackageJson;
        let packageJsonIndentSize = detectIndent(packageJsonData).indent || '    ';
        let done: number = 0;

        for (const addon of addons) {
            await addon.fetch();
            await addon.readTarball();

            const moduleContent = this.setup.isTypescript ? addon.tarballData?.initialModuleContent.ts : addon.tarballData?.initialModuleContent.js;
            if (!moduleContent) continue;

            const modulesFolder = path.join(this.dir, this.setup.isTypescript ? 'src' : 'modules');
            await mkdir(modulesFolder, { recursive: true });

            const modulePath = path.join(modulesFolder, `${addon.module}.${this.setup.isTypescript ? 'ts' : 'js'}`);
            await writeFile(modulePath, moduleContent);

            packageJson.dependencies = {
                ...packageJson.dependencies,
                [addon.module]: addon.version,
            };

            done++;

            this.persistSpinner({ symbol: kleur.bold().green('    +'), text: `Installed addon ${kleur.cyan(addon.module + '@' + (addon.version ?? 'latest'))}` });
            this.setSpinnerText(`Installing ${kleur.cyan(addons.length + ' addons')} ${kleur.gray('('+ done +'/'+ addons.length +')')}...`);
        }

        await writeFile(this.packageJsonPath, JSON.stringify(packageJson, null, packageJsonIndentSize), 'utf-8');
        this.persistSpinner({ symbol: kleur.bold().green('✔'), text: `${kleur.green('Addons installed.')}` });
    }

    public async setupEnv(): Promise<void> {
        const file = path.resolve(path.join(this.dir, '.env'));

        let content: string = '';
        if (await existsAsync(file)) content = await readFile(file, 'utf-8');

        if (!content.includes('TOKEN=')) {
            content += `\n# Replace this value to your Discord bot token from https://discord.com/developers/applications\nTOKEN="${this.setup.token ?? ''}"`;
            content = content.trim();
        }

        await writeFile(file, content);
    }

    public async installDependencies(): Promise<void> {
        await runScript(this.packageManagerPlaceholders.INSTALL_ALL, this.dir);
    }

    public setSpinnerText(text: string): void {
        if (!this.spinner) return;

        this.spinner.text = text;
    }

    public persistSpinner(options: PersistOptions): void {
        if (!this.spinner) return;
        this.spinner = this.spinner.stopAndPersist(options);
    }
}
