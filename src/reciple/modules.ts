import { existsSync, mkdirSync, readdirSync } from 'fs';
import { RecipleClient } from './classes/Client';
import { MessageCommandBuilder } from './classes/builders/MessageCommandBuilder';
import { InteractionCommandBuilder } from './classes/builders/InteractionCommandBuilder';
import path from 'path';

export type recipleCommands = (MessageCommandBuilder|InteractionCommandBuilder)[];
export type loadedModules = { commands: recipleCommands, modules: RecipleModule[] };

export interface RecipleScript {
    versions: string|string[];
    commands?: (MessageCommandBuilder|InteractionCommandBuilder)[];
    onLoad?: (reciple: RecipleClient) => void;
    onStart: (reciple: RecipleClient) => boolean;
}

export interface RecipleModule {
    script: RecipleScript;
    info: {
        filename: string;
        versions: string[];
        path: string;
    }
}

export async function loadModules (client: RecipleClient): Promise<loadedModules> {
    const response: loadedModules = { commands: [], modules: [] };
    const modulesDir = client.config?.modulesFolder || './modules';
    const logger = client.logger;
    
    if (!existsSync(modulesDir)) mkdirSync(modulesDir, { recursive: true });

    const scripts = readdirSync(modulesDir).filter(file => file.endsWith('.js') && (!file.startsWith('_') && !file.startsWith('.')));

    for (const script of scripts) {
        const modulePath = path.resolve(modulesDir, script);
        const commands: recipleCommands = [];
        let module_: RecipleScript;
        
        try {
            module_ = require(modulePath);

            if (!module_.versions || !(typeof module_.versions === 'object' ? module_.versions : [module_.versions]).includes(client.version)) throw new Error('Module versions is not defined or unsupported.');
            if (!module_.onStart(client)) throw new Error(script + ' onStart is not defined or returned false.');
            if (module_.commands) {
                for (const command of module_.commands) {
                    if (command.type === 'MESSAGE_COMMAND' || command.type === 'INTERACTION_COMMAND') commands.push(command);
                }
            }
        } catch (error) {
            logger.error(`Failed to load module ${script}`);
            logger.error(error);
            continue;
        }

        response.commands = response.commands.concat(commands.filter((c) => {
            if (!c.name) { logger.error(`A message command name is not defined in ${script}`); return false; }
            if (c instanceof MessageCommandBuilder && c.options.length && c.options.some(o => !o.name)) { logger.error(`A message command option name is not defined in ${script}`); return false; }
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