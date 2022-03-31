import { Client, ClientOptions } from 'discord.js';
import { Logger as LoggerConstructor } from 'fallout-utility';
import { MessageCommandBuilder } from './builders/MessageCommandBuilder';
import { InteractionCommandBuilder } from './builders/InteractionCommandBuilder';
import { logger } from '../logger';
import { loadModules, RecipleScript } from '../modules';
import { Config, RecipleConfig } from './Config';
import { version } from '../version';

export interface RecipleClientOptions extends ClientOptions {
    configPath: string;
}

export interface RecipleClientCommands {
    MESSAGE_COMMAND: any;
    INTERACTION_COMMANDS: any;
}

export class RecipleClient extends Client {
    public config?: Config;
    public commands: RecipleClientCommands = { MESSAGE_COMMAND: {}, INTERACTION_COMMANDS: {} };
    public modules: RecipleScript[] = [];
    public logger: LoggerConstructor = logger(false);
    public version: string = version;

    constructor(options: RecipleClientOptions) {
        super(options);

        this.logger.info('Reciple Client is starting...');
        this.config = new RecipleConfig(options.configPath).parseConfig().getConfig();
    }

    public async loadModules(): Promise<RecipleClient> {
        this.logger.info('Loading modules...');

        const modules = await loadModules(this);
        if (!modules) throw new Error('Failed to load modules.');

        this.modules = modules.modules.map(m => m.script);
        for (const command of modules.commands) {
            if (!command.name) continue; 
            if (command instanceof MessageCommandBuilder) {
                this.commands.MESSAGE_COMMAND[command.name] = command;
            } else if (command instanceof InteractionCommandBuilder) {
                this.commands.INTERACTION_COMMANDS[command.name] = command;
            }
        }

        this.logger.info(`${this.commands.MESSAGE_COMMAND.length} message commands loaded.`);
        this.logger.info(`${this.commands.INTERACTION_COMMANDS.length} interaction commands loaded.`);

        for (const module_ of this.modules) {
            if (typeof module_?.onLoad === 'function') await Promise.resolve(module_.onLoad(this));
        }

        this.logger.info(`${this.modules.length} modules loaded.`);

        return this;
    }
}