import type { Command } from 'commander';
import type { CLI } from '../classes/CLI.js';
import { Config } from '../classes/Config.js';
import { ModuleLoader } from '../classes/ModuleLoader.js';
import { kleur } from 'fallout-utility';
import path from 'node:path';

export interface CLIModulesFlags {
    config: string;
    json: boolean;
    pretty: boolean;
}

export default (command: Command, cli: CLI) => command
    .command('modules')
    .description('Lists all scannable modules')
    .option('-c, --config <file>', 'Set the config file path', 'reciple.mjs')
    .option('--json', 'Output JSON', false)
    .option('--pretty', 'Pretty print JSON', false)
    .action(async () => {
        const flags = cli.getFlags<CLIModulesFlags>('modules', true)!;
        const config = await Config.readConfigFile({ path: flags.config, createIfNotExists: false }).then(config => config?.config);

        const paths = config?.modules && await ModuleLoader.getModulePaths({
            config: config?.modules,
            cwd: cli.cwd,
            filter: ModuleLoader.defaultModulePathsFilter
        }) || [];

        if (flags.json) {
            process.stdout.write(JSON.stringify(paths, null, flags.pretty ? 2 : undefined));
            return;
        }

        const relativePaths = paths.map(p => path.relative(cli.cwd, p));

        console.log(
            relativePaths
                .map(p => {
                    const dirs = p.split(path.sep);
                    const name = dirs.pop();

                    dirs.unshift('.')

                    return `${dirs.map(d => kleur.cyan(d)).join(kleur.dim(' > '))}${kleur.dim(` > `)}${kleur.green(name || '')}`;
                })
                .join('\n')
        );
    })
