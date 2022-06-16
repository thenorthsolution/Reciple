import { program } from 'commander';

export const flags = program
        .option('-t, --token <token>', 'Replace used bot token')
        .option('-c, --config <config>', 'Change path to config file')
        .option('-D, --debugmode', 'Enabled debug mode')
        .option('-v, --version', 'Display version')
        .parse().opts();

export const token = flags.token;
