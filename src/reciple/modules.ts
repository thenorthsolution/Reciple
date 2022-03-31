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

export async function loadModules (Client: RecipleClient): Promise<loadedModules> {
    const response: loadedModules = { commands: [], modules: [] };
    const modulesDir = Client.config?.modulesFolder || './modules';
    const logger = Client.logger;
    
    if (!existsSync(modulesDir)) mkdirSync(modulesDir, { recursive: true });

    const scripts = readdirSync(modulesDir).filter(file => file.endsWith('.js') && (!file.startsWith('_') && !file.startsWith('.')));

    for (const script of scripts) {
        const modulePath = path.resolve(modulesDir, script);
        const commands: recipleCommands = [];
        let module_: RecipleScript; 
        
        try {
            module_ = require(modulePath);

            if (!module_.versions || !(typeof module_.versions === 'string' ? [module_.versions] : module_.versions).includes(Client.version)) throw new Error('Module versions is not defined.');
            if (!module_.onStart(Client)) throw new Error(script + ' onStart is not defined or returned false.');
            if (module_.commands) {
                for (const command of module_.commands) {
                    if (!(command instanceof MessageCommandBuilder) && !(command instanceof InteractionCommandBuilder)) { continue; }
                    commands.push(command);
                }
            }
        } catch (error) {
            logger.error(`Failed to load module ${script}`);
            logger.error(error);
            continue;
        }

        response.commands = response.commands.concat(commands);
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