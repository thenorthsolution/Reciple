import { RecipleClient } from './classes/RecipleClient';
import { RecipleCommandBuilder, RecipleCommandBuilderType } from './types/builders';
import { isSupportedVersion, version } from './version';

import { existsSync, mkdirSync, readdirSync } from 'fs';
import path from 'path';
import wildcard from 'wildcard-match';

export type LoadedModules = { commands: RecipleCommandBuilder[], modules: RecipleModule[] };

/**
 * Reciple script object interface
 */
export declare class RecipleScript {
    public versions: string | string[];
    public commands?: RecipleCommandBuilder[];
    public onLoad?(reciple: RecipleClient): void|Promise<void>;
    public onStart(reciple: RecipleClient): boolean|Promise<boolean>;
}

/**
 * Reciple module object interface
 */
export interface RecipleModule {
    script: RecipleScript;
    info: {
        filename?: string;
        versions: string[];
        path?: string;
    }
}

/**
 * Load modules from folder 
 * @param client Reciple client
 * @param folder Modules folder
 */
export async function loadModules(client: RecipleClient, folder?: string): Promise<LoadedModules> {
    const response: LoadedModules = { commands: [], modules: [] };
    const modulesDir = client.config.modulesFolder || folder || './modules';
    if (!existsSync(modulesDir)) mkdirSync(modulesDir, { recursive: true });

    const ignoredFiles = (client.config.ignoredFiles || []).map(file => file.endsWith('.js') ? file : `${file}.js`);
    const scripts = readdirSync(modulesDir).filter(file => {
        return file.endsWith('.js') && (!file.startsWith('_') && !file.startsWith('.')) && !ignoredFiles.some(f => wildcard(f)(file));
    });

    for (const script of scripts) {
        const modulePath = path.join(process.cwd(), modulesDir, script);
        const commands: RecipleCommandBuilder[] = [];
        let module_: RecipleScript;

        try {
            const reqMod = require(modulePath);
            module_ = typeof reqMod?.default != 'undefined' ? reqMod.default : reqMod;

            if (!module_.versions?.length) throw new Error('Module does not have supported versions.');
            const versions = typeof module_.versions === 'object' ? module_.versions : [module_.versions];

            if (!versions.some(v => isSupportedVersion(v, version))) throw new Error('Module versions is not defined or unsupported; supported versions: ' + module_.versions ?? 'none' + '; current version: '+ version);
            if (!await Promise.resolve(module_.onStart(client))) throw new Error(script + ' onStart is not defined or returned false.');
            if (module_.commands) {
                for (const command of module_.commands) {
                    if (command.builder === RecipleCommandBuilderType.MessageCommand || command.builder === RecipleCommandBuilderType.InteractionCommand) {
                        commands.push(command);
                    }
                }
            }
        } catch (error) {
            if (client.isClientLogsEnabled()) {
                client.logger.error(`Failed to load module ${script}`);
                client.logger.error(error);
            }
            continue;
        }

        response.commands.push(
            ...commands.filter((c) => {
                if (!c.name) {
                    if (client.isClientLogsEnabled()) client.logger.error(`A ${c.builder} command name is not defined in ${script}`);
                    return false;
                }

                if (c.builder === RecipleCommandBuilderType.MessageCommand && c.options.length && c.options.some(o => !o.name)) {
                    if (client.isClientLogsEnabled()) client.logger.error(`A ${c.builder} option name is not defined in ${script}`);
                    return false;
                }

                return true;
            })
        );

        response.modules.push({
            script: module_,
            info: {
                filename: script,
                versions: typeof module_.versions === 'string' ? [module_.versions] : module_.versions,
                path: modulePath
            }
        });

        if (client.isClientLogsEnabled()) client.logger.info(`Loaded module ${script}`);
    }

    return response;
}
