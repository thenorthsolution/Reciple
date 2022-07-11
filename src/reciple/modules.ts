import { InteractionCommandBuilder, RecipleInteractionCommandExecuteData } from './classes/builders/InteractionCommandBuilder';
import { MessageCommandBuilder, RecipleMessageCommandExecuteData } from './classes/builders/MessageCommandBuilder';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { version, isSupportedVersion } from './version';
import { RecipleClient } from './classes/RecipleClient';
import wildcard from 'wildcard-match';
import path from 'path';


export type RecipleCommandBuilders = MessageCommandBuilder|InteractionCommandBuilder;
export type RecipleCommandBuildersExecuteData = RecipleInteractionCommandExecuteData|RecipleMessageCommandExecuteData;
export type LoadedModules = { commands: RecipleCommandBuilders[], modules: RecipleModule[] };

export declare class RecipleScript {
    public versions: string | string[];
    public commands?: RecipleCommandBuilders[];
    public onLoad?(reciple: RecipleClient): void|Promise<void>;
    public onStart(reciple: RecipleClient): boolean|Promise<boolean>;
}

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
        const commands: RecipleCommandBuilders[] = [];
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
                    if (command.builder === 'MESSAGE_COMMAND' || command.builder === 'INTERACTION_COMMAND') commands.push(command);
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

                if (c.builder === 'MESSAGE_COMMAND' && c.options.length && c.options.some(o => !o.name)) {
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
