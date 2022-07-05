import { program } from 'commander';

/**
 * Used flags
 */
export const flags = program
        .option('-t, --token <token>', 'Replace used bot token')
        .option('-c, --config <config>', 'Change path to config file')
        .option('-D, --debugmode', 'Enabled debug mode')
        .option('-v, --version', 'Display version')
        .parse().opts();

/**
 * Temporary token flag
 */
export const token: string|undefined = flags.token;
