import { Client, ClientEvents, ClientOptions, Interaction, Message } from 'discord.js';
import { getCommand, Logger as LoggerConstructor } from 'fallout-utility';
import { MessageCommandBuilder, RecipleMessageCommandExecute } from './builders/MessageCommandBuilder';
import { InteractionCommandBuilder, RecipleInteractionCommandExecute } from './builders/InteractionCommandBuilder';
import { registerInteractionCommands } from '../registerInteractionCommands';
import { logger } from '../logger';
import { loadModules, RecipleScript } from '../modules';
import { Config } from './Config';
import { version } from '../version';
import { commandPermissions } from '../commandPermissions';

export interface RecipleClientOptions extends ClientOptions {
    config: Config;
}

export interface RecipleClientCommands {
    MESSAGE_COMMANDS: { [key: string]: MessageCommandBuilder };
    INTERACTION_COMMANDS: { [key: string]: InteractionCommandBuilder };
}

// TODO: Add these events to the client
export interface RecipleClientEvents extends ClientEvents {
    recipleMessageCommandCreate: [command: RecipleMessageCommandExecute];
    recipleInteractionCommandCreate: [command: RecipleInteractionCommandExecute];
}

export class RecipleClient extends Client {
    public config?: Config;
    public commands: RecipleClientCommands = { MESSAGE_COMMANDS: {}, INTERACTION_COMMANDS: {} };
    public modules: RecipleScript[] = [];
    public logger: LoggerConstructor = logger(false);
    public version: string = version;

    constructor(options: RecipleClientOptions) {
        super(options);

        if (!options.config) throw new Error('Config is not defined.');
        this.config = options.config;

        if (this.config.fileLogging.enabled) this.logger.logFile(this.config.fileLogging.logFilePath, false);

        this.logger.info('Reciple Client v'+ version +' is starting...');
    }

    public async startModules(): Promise<RecipleClient> {
        this.logger.info('Loading modules...');

        const modules = await loadModules(this);
        if (!modules) throw new Error('Failed to load modules.');

        this.modules = modules.modules.map(m => m.script);
        for (const command of modules.commands) {
            if (!command.name) continue; 
            if (command.type === 'MESSAGE_COMMAND') {
                this.commands.MESSAGE_COMMANDS[command.name] = command as MessageCommandBuilder;
            } else if (command.type === 'INTERACTION_COMMAND') {
                this.commands.INTERACTION_COMMANDS[command.name] = command as InteractionCommandBuilder;
            }
        }

        this.logger.info(`${Object.keys(this.commands.MESSAGE_COMMANDS).length} message commands loaded.`);
        this.logger.info(`${Object.keys(this.commands.INTERACTION_COMMANDS).length} interaction commands loaded.`);

        return this;
    }

    public async loadModules(): Promise<RecipleClient> {
        for (const module_ of this.modules) {
            if (typeof module_?.onLoad === 'function') await Promise.resolve(module_.onLoad(this));
        }

        this.logger.info(`${this.modules.length} modules loaded.`);
        
        if (this.config?.commands.interactionCommand.registerCommands) await registerInteractionCommands(this);
        return this;
    }

    public addCommandListeners(): RecipleClient {
        if (this.config?.commands.messageCommand.enabled) this.on('messageCreate', (message) => { this.messageCommandExecute(message) });
        if (this.config?.commands.interactionCommand.enabled) this.on('interactionCreate', (interaction) => { this.interactionCommandExecute(interaction) });

        return this;
    }

    public async messageCommandExecute(message: Message): Promise<RecipleClient> {
        if (!message.content) return this;
        const parseCommand = getCommand(message.content, this.config?.prefix || '!', this.config?.commands.messageCommand.commandArgumentSeparator || ' ');
        if (parseCommand && parseCommand.command) {
            const command = this.commands.MESSAGE_COMMANDS[parseCommand.command];

            if (command && commandPermissions(command.name, message.member?.permissions || null, this.config?.permissions.messageCommands)) {
                if (!command.allowExecuteInDM && message.channel.type === 'DM') return this;
                if (!command.allowExecuteByBots && (message.author.bot || message.author.system)) return this;
                if (command.validateOptions && !command.getCommandOptionValues(parseCommand)) {
                    await message.reply(this.config?.messages.notEnoughArguments || 'Not enough arguments.').catch((err) => this.logger.error(err));
                    return this;
                }
                
                const options: RecipleMessageCommandExecute = {
                    message: message,
                    command: parseCommand,
                    builder: command,
                    client: this
                };

                await Promise.resolve(command.execute(options));
                this.emit('recipleMessageCommandCreate', options);
            }
        }

        return this;
    }

    public async interactionCommandExecute(interaction: Interaction): Promise<RecipleClient> {
        if(!interaction || !interaction.isCommand()) return this;

        const command = this.commands.INTERACTION_COMMANDS[interaction.commandName];

        if (command && commandPermissions(command.name, interaction.memberPermissions, this.config?.permissions.interactionCommands)) {
            if (!command.allowExecuteInDM && interaction.member === null) return this;

            const options: RecipleInteractionCommandExecute = {
                interaction: interaction,
                command: command,
                builder: command,
                client: this
            };
            await Promise.resolve(command.execute(options));
            this.emit('recipleInteractionCommandCreate', options);
        } 

        return this;
    }
}