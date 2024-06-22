import { cancel, confirm, intro, isCancel, multiselect, password, select, text } from '@clack/prompts';
import { PackageManager, resolvePackageManager } from '@reciple/utils';
import { packageJson, packageManagers } from '../utils/constants.js';
import { isDirEmpty } from '../utils/helpers.js';
import { kleur } from 'fallout-utility/strings';
import { existsSync, statSync } from 'node:fs';
import { Addon } from './Addon.js';
import path from 'node:path';

export interface SetupOptions {
    dir?: string;
    isTypescript?: boolean;
    packageManager?: PackageManager|null;
    addons?: string[];
    token?: string;
}

export class Setup implements SetupOptions {
    public dir?: string;
    public isTypescript?: boolean;
    public packageManager?: PackageManager|null;
    public addons?: string[];
    public token?: string;

    get isDone() {
        return !!(this.dir && this.isTypescript && this.packageManager !== undefined && this.addons && this.token);
    }

    public introShown: boolean = false;

    constructor(options?: SetupOptions) {
        this.dir = options?.dir ? path.resolve(options?.dir) : undefined;
        this.isTypescript = options?.isTypescript;
        this.packageManager = options?.packageManager;
        this.addons = options?.addons;
        this.token = options?.token;
    }

    /**
     * Prompts the user for input to set up the necessary parameters for creating a reciple.
     *
     * @param {boolean} force - Whether to force override existing files in the directory.
     * @return {Promise<this>} A promise that resolves to the current instance of the Setup class.
     */
    public async prompt(force: boolean = false): Promise<this> {
        if (this.isDone) return this;

        intro(kleur.cyan().bold(`${packageJson.name} v${packageJson.version}`))
        this.introShown = true;

        await this.promptDir(this.dir);

        this.dir ||= process.cwd();

        if (!force && !(await isDirEmpty(this.dir))) {
            const override = await confirm({
                message: `Directory is not empty! Would you like to continue?`,
                initialValue: false,
                active: `Yes`,
                inactive: `No`
            });

            if (isCancel(override) || override === false) {
                await this.cancelPrompts();
                return this;
            }
        }

        await this.promptIsTypescript(this.isTypescript);
        await this.promptPackageManager(this.packageManager);
        await this.promptAddons(this.addons);
        await this.promptToken(this.token);

        return this;
    }

    public async promptDir(dir?: string): Promise<string> {
        if (dir) return this.dir = dir;

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

        return isCancel(newDir) ? this.cancelPrompts() : this.dir = path.resolve(newDir);
    }

    public async promptIsTypescript(isTypescript?: boolean): Promise<boolean> {
        if (typeof isTypescript === 'boolean') return this.isTypescript = isTypescript;

        const newIsTypescript = await confirm({
            message: `Would you like to use typescript?`,
            initialValue: false,
            active: `Yes`,
            inactive: `No`
        });

        return isCancel(newIsTypescript) ? this.cancelPrompts() : this.isTypescript = newIsTypescript;
    }

    public async promptAddons(addons?: string[]): Promise<string[]> {
        if (addons) return this.addons = addons;

        const newAddons = await multiselect<{ label?: string; hint?: string; value: string; }[], string>({
            message: `Select a addons from Reciple ${kleur.gray('(Press space to select, and enter to submit)')}`,
            options: Object.keys(Addon.DEFAULT_ADDON_VERSIONS).map(a => ({
                label: a,
                value: a
            })),
            required: false
        });

        return isCancel(newAddons) ? this.cancelPrompts() : this.addons = newAddons;
    }

    public async promptPackageManager(packageManager?: PackageManager|null): Promise<PackageManager|null> {
        if (packageManager !== undefined) return this.packageManager = packageManager;

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

        if (isCancel(newPackageManager)) return this.cancelPrompts();

        return this.packageManager = newPackageManager !== 'none' ? newPackageManager : null;
    }

    public async promptToken(token?: string): Promise<string> {
        if (typeof token === 'string') return this.token = token;

        const newToken = await password({
            message: `Enter your Discord bot token from Developers Portal`,
            mask: '*'
        });

        return isCancel(newToken) ? this.cancelPrompts() : this.token = newToken;
    }

    /**
     * Cancels the prompts and exits the process with the given reason.
     *
     * @param {string} [reason] - The reason for cancelling the prompts.
     * @return {Promise<never>} - A promise that never resolves.
     */
    public async cancelPrompts(reason?: string): Promise<never> {
        cancel(reason ?? 'Operation cancelled');
        process.exit(0);
    }

    /**
     * Returns a SetupOptions object with the current setup details.
     *
     * @return {SetupOptions} The setup options object.
     */
    public toJSON(): SetupOptions {
        return {
            dir: this.dir,
            isTypescript: this.isTypescript,
            packageManager: this.packageManager,
            token: this.token,
            addons: this.addons
        };
    }
}
