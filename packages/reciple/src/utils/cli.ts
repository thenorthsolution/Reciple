import { realVersion } from '@reciple/client';
import { Command } from 'commander';
import { path } from 'fallout-utility';
import { readFileSync } from 'fs';

const { version } = JSON.parse(readFileSync(path.join(__dirname, '../../package.json'), 'utf-8'));

export const command = new Command()
    .name('reciple')
    .description('Reciple.js - Discord.js handler cli')
    .version(`Reciple CLI: ${version}\nReciple Client: ${realVersion}`, '-v, --version')
    .argument('[cwd]', 'Change the current working directory')
    .option('-t, --token <token>', 'Replace used bot token')
    .option('-c, --config <dir>', 'Change path to config file')
    .option('-D, --debugmode', 'Enable debug mode')
    .option('-y, --yes', 'Agree to all Reciple confirmation prompts')
    .option('--env', '.env file location')
    .option('--ts', 'Resolve Typescript modules')
    .option('--ts-cache-dir <dir>', 'Set cache dir for resolved Typescript modules (requires: @adonisjs/require-ts)', 'node_modules/.cache/')
    .allowUnknownOption(true)
    .parse();

export const flags = command.opts();
export const cwd = command.args[0] ? path.resolve(command.args[0]) : process.cwd();
