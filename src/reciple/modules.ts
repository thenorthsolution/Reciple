import { existsSync, mkdirSync, readdirSync } from 'fs';
import { RecipleClient } from './classes/Client';
import { version, isSupportedVersion } from './version';
import { MessageCommandBuilder } from './classes/builders/MessageCommandBuilder';
import { InteractionCommandBuilder } from './classes/builders/InteractionCommandBuilder';
import path from 'path';

export type recipleCommands = (MessageCommandBuilder | InteractionCommandBuilder)[];
export type loadedModules = { commands: recipleCommands, modules: RecipleModule[] };

export interface RecipleScript {
    versions: string | string[];
    commands?: (MessageCommandBuilder|InteractionCommandBuilder)[];
    onLoad?(reciple: RecipleClient): void|Promise<void>;
    onStart(reciple: RecipleClient): boolean|Promise<boolean>;
}

export interface RecipleModule {
    script: RecipleScript;
    info: {
        filename: string;
        versions: string[];
        path: string;
    }
}

export async function loadModules(client: RecipleClient): Promise<loadedModules> {
    const response: loadedModules = { commands: [], modules: [] };
    const modulesDir = client.config?.modulesFolder || './modules';
    const logger = client.logger;

    if (!existsSync(modulesDir)) mkdirSync(modulesDir, { recursive: true });

    const ignoredFiles = (client.config?.ignoredFiles || []).map(file => file.endsWith('.js') ? file : `${file}.js`);
    const scripts = readdirSync(modulesDir).filter(file => {
        return file.endsWith('.js') && (!file.startsWith('_') && !file.startsWith('.')) && !ignoredFiles.includes(file);
    });

    for (const script of scripts) {
        const modulePath = path.resolve(modulesDir, script);
        const commands: recipleCommands = [];
        let module_: RecipleScript;

        try {
            const reqMod = require(modulePath);
            module_ = !!reqMod?.default ? reqMod.default : reqMod;

            if (!module_.versions?.length) throw new Error('Module does not have supported versions.');
            const versions = typeof module_.versions === 'object' ? module_.versions : [module_.versions];

            if (!versions.some(v => isSupportedVersion(v, version))) throw new Error('Module versions is not defined or unsupported.');
            if (!await Promise.resolve(module_.onStart(client))) throw new Error(script + ' onStart is not defined or returned false.');
            if (module_.commands) {
                for (const command of module_.commands) {
                    if (command.builder === 'MESSAGE_COMMAND' || command.builder === 'INTERACTION_COMMAND') commands.push(command);
                }
            }
        } catch (error) {
            logger.error(`Failed to load module ${script}`);
            logger.error(error);
            continue;
        }

        response.commands = response.commands.concat(commands.filter((c) => {
            if (!c.name) { logger.error(`A message command name is not defined in ${script}`); return false; }
            if ((c as MessageCommandBuilder).builder === 'MESSAGE_COMMAND' && c.options.length && (c as MessageCommandBuilder).options.some(o => !o.name)) { logger.error(`A message command option name is not defined in ${script}`); return false; }
            return true;
        }));
        response.modules.push({
            script: module_,
            info: {
                filename: script,
                versions: typeof module_.versions === 'string' ? [module_.versions] : module_.versions,
                path: modulePath
            }
        });

        logger.info(`Loaded module ${script}`);
    }

    return response;
}
