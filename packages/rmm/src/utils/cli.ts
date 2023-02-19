import { Command, program } from 'commander';
import { path } from 'fallout-utility';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const rootDir = path.join(__dirname, '../../');

export const packageJson = JSON.parse(readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));

export const cli = new Command()
    .name('rmm')
    .description(packageJson.description)
    .version(`Reciple Module Manager: v${packageJson.version}`, '-v, --version')
    .option('-c, --recipleYml <reciple.yml>', 'Set the location of reciple.yml file', './reciple.yml')
    .option('-m, --modulesFolder <dir>', 'Set the location of modules folder')
    .option('--cwd <dir>', 'Set current working directory', './')
    .option('-D, --debug', 'Enable debug logs');

export const opts = program
    .option('-c, --recipleYml <reciple.yml>', 'Set the location of reciple.yml file', './reciple.yml')
    .option('-m, --modulesFolder <dir>', 'Set the location of modules folder')
    .option('--cwd <dir>', 'Set current working directory', './')
    .option('-D, --debug', 'Enable debug logs')
    .helpOption(false)
    .allowUnknownOption(true)
    .allowUnknownOption(true)
    .parse()
    .opts<{ recipleYml: string; modulesFolder: string|undefined; cwd: string; debug: boolean; }>();

export const cwd = path.resolve(opts.cwd);
export const cacheDir = path.join(rootDir, 'cache');
export const commandsDir = path.join(rootDir, 'bin/commands');

export const debug = opts.debug;

export const modulesFolder = opts.modulesFolder
        ? path.isAbsolute(opts.modulesFolder)
            ? opts.modulesFolder
            : path.join(cwd, opts.modulesFolder)
        : undefined;

export const recipleYml = opts.recipleYml
        ? path.isAbsolute(opts.recipleYml)
            ? opts.recipleYml
            : path.join(cwd, opts.recipleYml)
        : undefined;
