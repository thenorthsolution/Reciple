// Dear precious programmer,
// If you're trying to understand this code, please, consider that
// at the time of writing this code, It was written the way humans
// can understand it but I transformed into a dog at Apr 12th 2022
// and accidentally made it unreadable for humans. So, if you're
// trying to understand this code, please, consider being a dog first.

import { InteractionCommandBuilder, RecipleInteractionCommandExecute } from './builders/InteractionCommandBuilder';
import { interactionCommandBuilders, registerInteractionCommands } from '../registerInteractionCommands';
import { MessageCommandBuilder, RecipleMessageCommandExecute } from './builders/MessageCommandBuilder';
import { getCommand, Logger as ILogger } from 'fallout-utility';
import { isIgnoredChannel } from '../isIgnoredChannel';
import { hasPermissions } from '../hasPermissions';
import { version } from '../version';
import { logger } from '../logger';
import { Config, RecipleConfig } from './RecipleConfig';

import {
    ApplicationCommandDataResolvable,
    Awaitable,
    Client,
    ClientEvents,
    ClientOptions,
    CommandInteraction,
    Interaction,
    Message
} from 'discord.js';

import {
    loadModules,
    recipleCommandBuilders,
    recipleCommandBuildersExecute,
    RecipleModule,
    RecipleScript
} from '../modules';
import { MessageCommandOptions } from './builders/MessageCommandOptions';


export interface RecipleClientOptions extends ClientOptions {
    config?: Config;
}

export interface RecipleClientCommands {
    MESSAGE_COMMANDS: { [commandName: string]: MessageCommandBuilder };
    INTERACTION_COMMANDS: { [commandName: string]: InteractionCommandBuilder };
}

export interface RecipleClientEvents extends ClientEvents {
    recipleMessageCommandCreate: [command: RecipleMessageCommandExecute];
    recipleInteractionCommandCreate: [command: RecipleInteractionCommandExecute];
    recipleReplyError: [error: unknown];
}

export interface RecipleClient<Ready extends boolean = boolean> extends Client<Ready> {
    on<E extends keyof RecipleClientEvents>(event: E, listener: (...args: RecipleClientEvents[E]) => Awaitable<void>): this;
    on<E extends string|symbol>(event: Exclude<E, keyof RecipleClientEvents>, listener: (...args: any) => Awaitable<void>): this;
    
    once<E extends keyof RecipleClientEvents>(event: E, listener: (...args: RecipleClientEvents[E]) => Awaitable<void>): this;
    once<E extends keyof string|symbol>(event: Exclude<E, keyof RecipleClientEvents>, listener: (...args: any) => Awaitable<void>): this;

    emit<E extends keyof RecipleClientEvents>(event: E, ...args: RecipleClientEvents[E]): boolean;
    emit<E extends string|symbol>(event: Exclude<E, keyof RecipleClientEvents>, ...args: any): boolean;

    off<E extends keyof RecipleClientEvents>(event: E, listener: (...args: RecipleClientEvents[E]) => Awaitable<void>): this;
    off<E extends string|symbol>(event: Exclude<E, keyof RecipleClientEvents>, listener: (...args: any) => Awaitable<void>): this;

    removeAllListeners<E extends keyof RecipleClientEvents>(event?: E): this;
    removeAllListeners(event?: string|symbol): this;

    isReady(): this is RecipleClient<true>;
}

export class RecipleClient<Ready extends boolean = boolean> extends Client<Ready> {
    public config: Config = RecipleConfig.getDefaultConfig();
    public commands: RecipleClientCommands = { MESSAGE_COMMANDS: {}, INTERACTION_COMMANDS: {} };
    public otherApplicationCommandData: (interactionCommandBuilders|ApplicationCommandDataResolvable)[] = [];
    public modules: RecipleModule[] = [];
    public logger: ILogger;
    public version: string = version;

    constructor(options: RecipleClientOptions) {
        super(options);

        this.logger = logger(!!options.config?.fileLogging.stringifyLoggedJSON, !!options.config?.fileLogging.debugmode);

        if (!options.config) throw new Error('Config is not defined.');
        this.config = {...this.config, ...(options.config ?? {})};

        if (this.config.fileLogging.enabled) this.logger.logFile(this.config.fileLogging.logFilePath, false);
    }

    /**
     * Load modules
     */
    public async startModules(folder?: string): Promise<RecipleClient<Ready>> {
        if (this.isClientLogsEnabled()) this.logger.info(`Loading Modules from ${folder ?? this.config.modulesFolder}`);

        const modules = await loadModules(this, folder);
        if (!modules) throw new Error('Failed to load modules.');

        this.modules = modules.modules;
        return this;
    }

    /**
     * Execute `onLoad()` from client modules and register interaction commands if enabled
     */
    public async loadModules(): Promise<RecipleClient<Ready>> {
        for (const m in this.modules) {
            const module_ = this.modules[m];
            if (typeof module_.script?.onLoad === 'function') {
                await Promise.resolve(module_.script.onLoad(this)).catch(err => {
                    if (this.isClientLogsEnabled()) {
                        this.logger.error(`Error loading ${module_.info.filename ?? 'unknown module'}:`);
                        this.logger.error(err);
                    }

                    this.modules = this.modules.filter((r, i) => i.toString() !== m.toString());
                });
            }

            if (typeof module_.script?.commands !== 'undefined') {
                for (const command of module_.script.commands) {
                    this.addCommand(command);
                }
            }
        }

        if (this.isClientLogsEnabled()) {
            this.logger.info(`${this.modules.length} modules loaded.`);
            this.logger.info(`${Object.keys(this.commands.MESSAGE_COMMANDS).length} message commands loaded.`);
            this.logger.info(`${Object.keys(this.commands.INTERACTION_COMMANDS).length} interaction commands loaded.`);
        }

        if (!this.config.commands.interactionCommand.registerCommands) return this;
        await registerInteractionCommands(this, [...Object.values(this.commands.INTERACTION_COMMANDS), ...this.otherApplicationCommandData]);
        return this;
    }

    /**
     * Add module
     */
    public async addModule(script: RecipleScript, registerCommands: boolean = true, info?: RecipleModule['info']): Promise<void> {
        this.modules.push({
            script,
            info: {
                filename: undefined,
                versions: typeof script.versions == 'string' ? [script.versions] : script.versions,
                path: undefined,
                ...info
            }
        });
        if (typeof script?.onLoad === 'function') await Promise.resolve(script.onLoad(this));

        if (this.isClientLogsEnabled()) this.logger.info(`${this.modules.length} modules loaded.`);
        for (const command of script.commands ?? []) {
            if (!command.name) continue;
            this.addCommand(command);
        }

        if (!registerCommands || !this.config.commands.interactionCommand.registerCommands) return;
        await registerInteractionCommands(this, [...Object.values(this.commands.INTERACTION_COMMANDS), ...this.otherApplicationCommandData]);
    }

    /**
     * Add interaction or message command to client 
     */
    public addCommand(command: recipleCommandBuilders): RecipleClient<Ready> {
        if (command.builder === 'MESSAGE_COMMAND') {
            this.commands.MESSAGE_COMMANDS[command.name] = command;
        } else if (command.builder === 'INTERACTION_COMMAND') {
            this.commands.INTERACTION_COMMANDS[command.name] = command;
        } else if (this.isClientLogsEnabled()) {
            this.logger.error(`Unknow command "${typeof command ?? 'unknown'}".`);
        }

        return this;
    }

    /**
     * Listed to command executions
     */
    public addCommandListeners(): RecipleClient<Ready> {
        if (this.config.commands.messageCommand.enabled) this.on('messageCreate', (message) => { this.messageCommandExecute(message) });
        if (this.config.commands.interactionCommand.enabled) this.on('interactionCreate', (interaction) => { this.interactionCommandExecute(interaction) });

        return this;
    }

    /**
     * Execute a Message command
     */
    public async messageCommandExecute(message: Message, prefix?: string): Promise<void|RecipleMessageCommandExecute> {
        if (!message.content || !this.isReady()) return;

        const parseCommand = getCommand(message.content, prefix || this.config.prefix || '!', this.config.commands.messageCommand.commandArgumentSeparator || ' ');
        if (!parseCommand || !parseCommand?.command) return; 

        const command = this.findCommand(parseCommand.command, 'MESSAGE_COMMAND');
        if (!command) return;

        if (hasPermissions(command.name, message.member?.permissions, this.config.permissions.messageCommands, command)) {
            if (
                !command.allowExecuteInDM && message.channel.type === 'DM'
                || !command.allowExecuteByBots
                && (message.author.bot ||message.author.system)
                || isIgnoredChannel(message.channelId, this.config.ignoredChannels)
            ) return;

            const commandOptions = command.getCommandOptionValues(parseCommand);

            if (command.validateOptions) {
                if (commandOptions.some(o => o.invalid)) {
                    await message.reply(this.getMessage('invalidArguments', 'Invalid argument(s) given.')).catch(er => this.replpyError(er));
                    return;
                }

                if (commandOptions.some(o => o.missing)) {
                    await message.reply(this.getMessage('notEnoughArguments', 'Not enough arguments.')).catch(er => this.replpyError(er));
                    return;
                }
            }

            const options: RecipleMessageCommandExecute = {
                message: message,
                options: new MessageCommandOptions(commandOptions),
                command: parseCommand,
                builder: command,
                client: this
            };

            await Promise.resolve(command.execute(options)).catch(err => this._commandExecuteError(err, options));
            this.emit('recipleMessageCommandCreate', options);
            return options;
        } else {
            await message.reply(this.getMessage('noPermissions', 'You do not have permission to use this command.')).catch(er => this.replpyError(er));
        }
    }

    /**
     * Execute an Interaction command 
     */
    public async interactionCommandExecute(interaction: Interaction|CommandInteraction): Promise<void|RecipleInteractionCommandExecute> {
        if (!interaction || !interaction.isCommand() || !this.isReady()) return;

        const command = this.findCommand(interaction.commandName, 'INTERACTION_COMMAND');
        if (!command) return;

        if (hasPermissions(command.name, interaction.memberPermissions ?? undefined, this.config.permissions.interactionCommands, command)) {
            if (!command || isIgnoredChannel(interaction.channelId, this.config.ignoredChannels)) return;

            const options: RecipleInteractionCommandExecute = {
                interaction: interaction,
                command: command,
                builder: command,
                client: this
            };

            await Promise.resolve(command.execute(options)).catch(err => this._commandExecuteError(err, options));
            this.emit('recipleInteractionCommandCreate', options);
            return options;
        } else {
            await interaction.reply(this.getMessage('noPermissions', 'You do not have permission to use this command.')).catch(er => this.replpyError(er));
        }
    }

    /**
     * Get a message from config 
     */
    public getMessage<T = unknown>(messageKey: string, defaultMessage?: T): T {
        return this.config.messages[messageKey] ?? defaultMessage ?? messageKey;
    }

    public findCommand(command: string, type: MessageCommandBuilder["builder"]): MessageCommandBuilder|undefined;
    public findCommand(command: string, type: InteractionCommandBuilder["builder"]): InteractionCommandBuilder|undefined;
    public findCommand(command: string, type: recipleCommandBuilders["builder"]): recipleCommandBuilders|undefined {
        switch (type) {
            case 'INTERACTION_COMMAND':
                return this.commands.INTERACTION_COMMANDS[command];
            case 'MESSAGE_COMMAND':
                return this.commands.MESSAGE_COMMANDS[command.toLowerCase()]
                    ?? (this.config.commands.messageCommand.allowCommandAlias
                        ? Object.values(this.commands.MESSAGE_COMMANDS).find(c => c.aliases.some(a => a == command?.toLowerCase()))
                        : undefined
                    );
            default:
                throw new TypeError('Unknown command type');
        }
    }

    /**
     * Returns true if client logs is enabled
     */
    public isClientLogsEnabled(): boolean {
        return !!this.config.fileLogging.clientLogs;
    }

    private replpyError(error: unknown) {
        this.emit('recipleReplyError', error);
    }

    /**
     * Error message when a command fails to execute
     */
    private async _commandExecuteError(err: Error, command: recipleCommandBuildersExecute): Promise<void> {
        if (this.isClientLogsEnabled()) {
            this.logger.error(`An error occured executing ${command.builder.builder == 'MESSAGE_COMMAND' ? 'message' : 'interaction'} command "${command.builder.name}"`);
            this.logger.error(err);
        }

        if (!err || !command) return;

        if ((command as RecipleMessageCommandExecute)?.message) {
            if (!this.config.commands.messageCommand.replyOnError) return;
            await (command as RecipleMessageCommandExecute).message.reply(this.getMessage('error', 'An error occurred.')).catch(er => this.replpyError(er));
        } else if ((command as RecipleInteractionCommandExecute)?.interaction) {
            if (!this.config.commands.interactionCommand.replyOnError) return;
            await (command as RecipleInteractionCommandExecute).interaction.followUp(this.getMessage('error', 'An error occurred.')).catch(er => this.replpyError(er));
        }
    }
}
