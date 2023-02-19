import { Command } from 'commander';
import { Registry, cli } from '../index.js';

export default (repository: Registry) => cli
    .command('add')
    .aliases(['i', 'install'])
    .description('Install or add modules')
    .action(async (args, command: Command) => {})
