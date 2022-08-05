import { AnyCommandBuilder, CommandBuilderType } from './types/builders';
import { RecipleClient } from './classes/RecipleClient';
import { isSupportedVersion, version } from './version';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import wildcard from 'wildcard-match';
import path from 'path';
import { normalizeArray, RestOrArray } from 'discord.js';

export type LoadedModules = { commands: AnyCommandBuilder[], modules: RecipleModule[] };

/**
 * Reciple script object interface
 */
export interface RecipleScript {
    versions: string | string[];
    commands?: AnyCommandBuilder[];
    onLoad?(reciple: RecipleClient): void|Promise<void>;
    onStart(reciple: RecipleClient): boolean|Promise<boolean>;
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
export async function getModules(client: RecipleClient, folder?: string): Promise<LoadedModules> {
    const response: LoadedModules = { commands: [], modules: [] };
    const modulesDir = folder || './modules';
    if (!existsSync(modulesDir)) mkdirSync(modulesDir, { recursive: true });

    const ignoredFiles = (client.config.ignoredFiles || []).map(file => file.endsWith('.js') ? file : `${file}.js`);
    const scripts = readdirSync(modulesDir).filter(file => {
        return file.endsWith('.js') && (!file.startsWith('_') && !file.startsWith('.')) && !ignoredFiles.some(f => wildcard(f)(file));
    });

    for (const script of scripts) {
        const modulePath = path.join(process.cwd(), modulesDir, script);
        const commands: AnyCommandBuilder[] = [];
        let module_: RecipleScript;

        try {
            const reqMod = require(modulePath);
            module_ = reqMod?.default !== undefined ? reqMod.default : reqMod;

            if (!module_?.versions.length) throw new Error(`${modulePath} does not have supported versions.`);
            
            const versions = normalizeArray([module_.versions] as RestOrArray<string>);

            if (!client.config.disableVersionCheck && !versions.some(v => isSupportedVersion(v, version))) throw new Error(`${modulePath} is unsupported; current version: ${version}; module supported versions: ` + versions.join(', ') ?? 'none');
            if (!await Promise.resolve(module_.onStart(client)).catch(() => null)) throw new Error(script + ' onStart returned false or undefined.');
            if (module_.commands) {
                for (const command of module_.commands) {
                    if (command.type === CommandBuilderType.MessageCommand || command.type === CommandBuilderType.SlashCommand) {
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
                    if (client.isClientLogsEnabled()) client.logger.error(`A ${CommandBuilderType[c.type]} command name is not defined in ${modulePath}`);
                    return false;
                }

                if (c.type === CommandBuilderType.MessageCommand && c.options.length && c.options.some(o => !o.name)) {
                    if (client.isClientLogsEnabled()) client.logger.error(`A ${CommandBuilderType[c.type]} option name is not defined in ${modulePath}`);
                    return false;
                }

                return true;
            })
        );

        response.modules.push({
            script: module_,
            info: {
                filename: script,
                versions: normalizeArray([module_.versions] as RestOrArray<string>),
                path: modulePath
            }
        });

        if (client.isClientLogsEnabled()) client.logger.info(`Loaded module ${modulePath}`);
    }

    return response;
}
