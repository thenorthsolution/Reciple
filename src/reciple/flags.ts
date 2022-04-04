import { program } from 'commander';
import path from 'path';

const flags = program
        .option('-t, --token <token>', 'Replace used bot token')
        .parse().opts();

export const token = flags.token;
