import { Command } from 'commander';

/**
 * Used flags
 */
export const flags = new Command()
        .name('reciple')
        .description('Reciple.js - Discord.js handler cli')
        .version(`v${require('../../package.json').version}`, '-v, --version')
        .option('-t, --token <token>', 'Replace used bot token')
        .option('-c, --config <config>', 'Change path to config file')
        .option('-D, --debugmode', 'Enabled debug mode')
        .option('-y, --yes', 'Automatically agree to Reciple confirmation prompts')
        .option('-v, --version', 'Display version')
        .parse().opts();

/**
 * Temporary token flag
 */
export const token: string|undefined = flags.token;
