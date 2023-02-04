import { realVersion } from '@reciple/client';
import { Command } from 'commander';
import { path } from 'fallout-utility';

export const command = new Command()
    .name('reciple')
    .description('Reciple.js - Discord.js handler cli')
    .version(`v${realVersion}`, '-v, --version')
    .argument('[cwd]', 'Change the current working directory')
    .option('-t, --token <token>', 'Replace used bot token')
    .option('-c, --config <config>', 'Change path to config file')
    .option('-D, --debugmode', 'Enable debug mode')
    .option('-y, --yes', 'Agree to all Reciple confirmation prompts')
    .option('--env', '.env file location')
    .parse();

export const flags = command.opts();
export const cwd = command.args[0] ? path.resolve(command.args[0]) : process.cwd();