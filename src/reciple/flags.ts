import { program } from 'commander';
import path from 'path';

const flags = program
        .option('-C, --config-dir <path>', 'Config directory path', './')
        .option('-t, --token <token>', 'Replace used bot token')
        .parse().opts();

export const configDir = path.resolve(flags.configDir) || './';
export const token = flags.token || undefined;