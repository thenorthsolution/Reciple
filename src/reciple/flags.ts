import { program } from 'commander';

export const flags = program
        .option('-t, --token <token>', 'Replace used bot token')
        .option('-D, --debugmode', 'Enabled debug mode')
        .parse().opts();

export const token = flags.token;
