import { packageManagerPlaceholders, packages, root } from '../utils/constants.js';
import { recursiveCopyFiles, runScript } from '../utils/helpers.js';
import { mkdir, readFile, writeFile } from 'fs/promises';
import type { TemplateMetadata } from '../utils/types.js';
import { kleur, type PackageJson } from 'fallout-utility';
import ora, { type Ora, type PersistOptions } from 'ora';
import { existsAsync } from '@reciple/utils';
import { type SetupOptions } from './Setup.js';
import detectIndent from 'detect-indent';
import { type RecipleConfig } from 'reciple';
import { Config } from './Config.js';
import { Addon } from './Addon.js';
import path from 'node:path';

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

    /**
     * Builds the template by performing the following steps:
     * 1. Initializes the spinner.
     * 2. Creates the directory if it does not exist.
     * 3. Copies the template files.
     * 4. Copies the assets.
     * 5. Sets up the package.json file.
     * 6. Sets up the configuration.
     * 7. Sets up the addons.
     * 8. Sets up the environment.
     * 9. Succeeds the spinner.
     * 10. Installs dependencies if the package manager is specified.
     * 11. Logs the project readiness message.
     * 12. Logs the start developing message.
     * 13. Logs the command to navigate to the project directory if the current working directory is not the project directory.
     * 14. Logs the command to install all dependencies if the package manager is not specified.
     * 15. Logs the command to run the dev script.
     *
     * @return {Promise<void>} A Promise that resolves when the build is complete.
     */
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

        if (this.setup.packageManager) {
            await this.installDependencies();

            if (this.setup.isTypescript) await runScript(`${this.packageManagerPlaceholders.SCRIPT_RUN} build`, this.dir);
        }

        console.log(`${kleur.bold(kleur.green('✔') + ' Your project is ready!')}`);
        console.log(`\nStart developing:`);

        if (path.relative(process.cwd(), this.dir) !== '') {
            console.log(`  • ${kleur.cyan().bold('cd ' + path.relative(process.cwd(), this.dir))}`);
        }

        if (!this.setup.packageManager) console.log(`  • ${kleur.cyan().bold(this.packageManagerPlaceholders.INSTALL_ALL)} (or ${packageManagerPlaceholders.pnpm.INSTALL_ALL}, etc)`);

        console.log(`  • ${kleur.cyan().bold(`${this.packageManagerPlaceholders.SCRIPT_RUN} dev`)} ${kleur.gray('(Development)')}`);
        console.log(`  • ${kleur.cyan().bold(`${this.packageManagerPlaceholders.SCRIPT_RUN} start`)} ${kleur.gray('(Production)')}`);
        console.log(kleur.green(`\nAll done! Make sure to read through the Reciple guide and docs to help you get started.`));
        console.log(`  • ${kleur.gray().bold(`Guide:`)} ${kleur.cyan('https://reciple.js.org/guide')}`);
        console.log(`  • ${kleur.gray().bold(`Docs:`)} ${kleur.cyan('https://reciple.js.org/docs')}`);
    }

    /**
     * Copies the template files to the specified directory.
     *
     * @return {Promise<void>} A Promise that resolves when the template files are copied.
     */
    public async copyTemplateFiles(): Promise<void> {
        this.setSpinnerText('Copying template files...');
        await recursiveCopyFiles(this.template.path, this.dir, f => f.replace('dot.', '.'));
        this.persistSpinner({ symbol: kleur.bold().green('✔'), text: 'Template files copied.' });
    }

    /**
     * Copies the asset files from the root directory to the current directory.
     *
     * @return {Promise<void>} A Promise that resolves when the asset files are copied.
     */
    public async copyAssets(): Promise<void> {
        this.setSpinnerText('Copying asset files...');

        if (await existsAsync(path.join(root, 'assets'))) {
            await recursiveCopyFiles(path.join(root, 'assets'), this.dir, f => f.replace('dot.', '.'));
        }

        this.persistSpinner({ symbol: kleur.bold().green('✔'), text: 'Copied all assets.' });
    }

    /**
     * Configures the package versions and scripts in the package.json file.
     *
     * @return {Promise<void>} A Promise that resolves when the package.json file is configured.
     */
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

    /**
     * Sets up the configuration for the `reciple.mjs` file by creating a new
     * configuration file in the specified directory. This function does not take
     * any parameters and returns a Promise that resolves when the configuration
     * file is successfully created.
     *
     * @return {Promise<void>} A Promise that resolves when the configuration
     * file is successfully created.
     */
    public async setupConfig(): Promise<void> {
        this.setSpinnerText(`Configuring ${kleur.green('reciple.mjs')}...`);

        await (new Config({ dir: this.dir })).setup({
            halts: [
                {
                    class: 'CommandErrorHalt',
                    from: './modules/halts/CommandErrorHalt.js',
                }
            ],
            preconditions: [
                {
                    class: 'ExamplePrecondition',
                    from: './modules/preconditions/ExamplePrecondition.js',
                }
            ]
        });

        this.persistSpinner({ symbol: kleur.bold().green('✔'), text: `${kleur.green('reciple.mjs')} configured.` });
    }

    /**
     * Sets up the addons for the template by installing the specified addons
     * and updating the package.json file with their dependencies. This function
     * takes no parameters and returns a Promise that resolves when the addons
     * are successfully installed.
     *
     * @return {Promise<void>} A Promise that resolves when the addons are
     * installed.
     */
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

            const modulesFolder = path.join(this.dir, this.setup.isTypescript ? 'src' : 'modules', 'addons');
            await mkdir(modulesFolder, { recursive: true });

            const modulePath = path.join(modulesFolder, `${addon.module}.${this.setup.isTypescript ? 'ts' : 'js'}`);
            await writeFile(modulePath, moduleContent);

            packageJson.dependencies = {
                ...packageJson.dependencies,
                [addon.module]: addon.version,
            };

            done++;

            this.persistSpinner({ symbol: kleur.bold().green('  +'), text: `Installed addon ${kleur.cyan(addon.module + '@' + (addon.version ?? 'latest'))}` });
            this.setSpinnerText(`Installing ${kleur.cyan(addons.length + ' addons')} ${kleur.gray('('+ done +'/'+ addons.length +')')}...`);
        }

        await writeFile(this.packageJsonPath, JSON.stringify(packageJson, null, packageJsonIndentSize), 'utf-8');
        this.persistSpinner({ symbol: kleur.bold().green('✔'), text: `${kleur.green('Addons installed.')}` });
    }

    /**
     * Sets up the environment by updating the .env file with the Discord bot token.
     * If the file already exists, it reads the content and appends the token.
     * If the token is not already present in the file, it adds a comment and the token.
     * The function does not return anything.
     *
     * @return {Promise<void>} A Promise that resolves when the environment setup is complete.
     */
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

    /**
     * Installs dependencies by running a script with the package manager placeholders.
     *
     * @return {Promise<void>} A Promise that resolves when the dependencies are installed.
     */
    public async installDependencies(): Promise<void> {
        await runScript(this.packageManagerPlaceholders.INSTALL_ALL, this.dir);
    }

    public setSpinnerText(text: string): void {
        if (!this.spinner) return;

        this.spinner.text = text;
    }

    public persistSpinner(options: PersistOptions): void {
        if (!this.spinner) return;

        const spinner = this.spinner.spinner;
        const color = this.spinner.color;

        this.spinner = this.spinner.stopAndPersist(options);
        this.spinner.spinner = spinner;
        this.spinner.color = color;
        this.spinner.start();
    }
}
