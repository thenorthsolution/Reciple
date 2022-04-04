import { program } from 'commander';

const flags = program
        .option('-t, --token <token>', 'Replace used bot token')
        .parse().opts();

export const token = flags.token;
