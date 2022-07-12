// Not cool code

import { InteractionCommandBuilder, RecipleInteractionCommandExecuteData } from './builders/InteractionCommandBuilder';
import { MessageCommandBuilder, RecipleMessageCommandExecuteData } from './builders/MessageCommandBuilder';
import { InteractionBuilder, registerInteractionCommands } from '../registerInteractionCommands';
import { RecipleCommandBuilders, RecipleCommandBuildersExecuteData } from '../types/builders';
import { botHasExecutePermissions, userHasCommandPermissions } from '../permissions';
import { CommandCooldownManager, CooledDownUser } from './CommandCooldownManager';
import { MessageCommandOptionManager } from './MessageCommandOptionManager';
import { loadModules, RecipleModule, RecipleScript } from '../modules';
import { getCommand, Logger as ILogger } from 'fallout-utility';
import { Config, RecipleConfig } from './RecipleConfig';
import { isIgnoredChannel } from '../isIgnoredChannel';
import { version } from '../version';
import { logger } from '../logger';

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

export interface RecipleClientOptions extends ClientOptions { config?: Config; }

export interface RecipleClientCommands {
    MESSAGE_COMMANDS: { [commandName: string]: MessageCommandBuilder };
    INTERACTION_COMMANDS: { [commandName: string]: InteractionCommandBuilder };
}

export interface RecipleClientEvents extends ClientEvents {
    recipleMessageCommandCreate: [executeData: RecipleMessageCommandExecuteData];
    recipleInteractionCommandCreate: [executeData: RecipleInteractionCommandExecuteData];
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
    public otherApplicationCommandData: (InteractionBuilder|ApplicationCommandDataResolvable)[] = [];
    public commandCooldowns: CommandCooldownManager = new CommandCooldownManager();
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

                    this.modules = this.modules.filter((_r, i) => i.toString() !== m.toString());
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

        if (this.config.commands.interactionCommand.registerCommands) {
            await registerInteractionCommands(this, [...Object.values(this.commands.INTERACTION_COMMANDS), ...this.otherApplicationCommandData]);
        }

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
    public addCommand(command: RecipleCommandBuilders): RecipleClient<Ready> {
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
    public async messageCommandExecute(message: Message, prefix?: string): Promise<void|RecipleMessageCommandExecuteData> {
        if (!message.content || !this.isReady()) return;

        const parseCommand = getCommand(message.content, prefix || this.config.prefix || '!', this.config.commands.messageCommand.commandArgumentSeparator || ' ');
        if (!parseCommand || !parseCommand?.command) return; 

        const command = this.findCommand(parseCommand.command, 'MESSAGE_COMMAND');
        if (!command) return;
        
        const commandOptions = command.getCommandOptionValues(parseCommand);
        const executeData: RecipleMessageCommandExecuteData = {
            message: message,
            options: new MessageCommandOptionManager(commandOptions),
            command: parseCommand,
            builder: command,
            client: this
        };

        if (userHasCommandPermissions(command.name, message.member?.permissions, this.config.permissions.messageCommands, command)) {
            if (
                !command.allowExecuteInDM && message.channel.type === 'DM'
                || !command.allowExecuteByBots
                && (message.author.bot ||message.author.system)
                || isIgnoredChannel(message.channelId, this.config.ignoredChannels)
            ) return;

            if (command.validateOptions) {
                if (commandOptions.some(o => o.invalid)) {
                    if (!command?.halt || !await command.halt({ executeData, reason: 'INVALID_ARGUMENTS', invalidArguments: new MessageCommandOptionManager(executeData.options.filter(o => o.invalid)) })) {
                        message.reply(this.getMessage('invalidArguments', 'Invalid argument(s) given.')).catch(er => this._replyError(er));
                    }
                    return;
                }

                if (commandOptions.some(o => o.missing)) {
                    if (!command.halt || !await command.halt({ executeData, reason: 'MISSING_ARGUMENTS', missingArguments: new MessageCommandOptionManager(executeData.options.filter(o => o.missing)) })) {
                        message.reply(this.getMessage('notEnoughArguments', 'Not enough arguments.')).catch(er => this._replyError(er));
                    }
                    return;
                }
            }

            if (message.guild && !botHasExecutePermissions(message.guild, command.requiredBotPermissions)) {
                if (!command.halt || !await command.halt({ executeData, reason: 'MISSING_BOT_PERMISSIONS' })) {
                    message.reply(this.getMessage('insufficientBotPerms', 'Insufficient bot permissions.')).catch(er => this._replyError(er));
                }
                return;
            }

            const userCooldown: Omit<CooledDownUser, "expireTime"> = {
                user: message.author,
                command: command.name,
                channel: message.channel,
                guild: message.guild,
                type: 'MESSAGE_COMMAND'
            };

            if (this.config.commands.messageCommand.enableCooldown && command.cooldown && !this.commandCooldowns.isCooledDown(userCooldown)) {
                this.commandCooldowns.add({ ...userCooldown, expireTime: Date.now() + command.cooldown });
            } else if (this.config.commands.messageCommand.enableCooldown && command.cooldown) {
                if (!command.halt || !await command.halt({ executeData, reason: 'COOLDOWN', ...this.commandCooldowns.get(userCooldown)! })) {
                    await message.reply(this.getMessage('cooldown', 'You cannot execute this command right now due to the cooldown.')).catch(er => this._replyError(er));
                }
                return;
            }

            try {
                await Promise.resolve(command.execute(executeData)).catch(async err => !command.halt || !await command.halt({ executeData, reason: 'ERROR', error: err }) ? this._commandExecuteError(err, executeData) : void 0);
                this.emit('recipleMessageCommandCreate', executeData);
                return executeData;
            } catch (err) {
                if (!command.halt || !await command.halt({ executeData, reason: 'ERROR', error: err })) {
                    this._commandExecuteError(err as Error, executeData);
                }
            }
        } else if (!command.halt || !await command.halt({ executeData, reason: 'MISSING_MEMBER_PERMISSIONS' })) {
            message.reply(this.getMessage('noPermissions', 'You do not have permission to use this command.')).catch(er => this._replyError(er));
        }
    }

    /**
     * Execute an Interaction command 
     */
    public async interactionCommandExecute(interaction: Interaction|CommandInteraction): Promise<void|RecipleInteractionCommandExecuteData> {
        if (!interaction || !interaction.isCommand() || !this.isReady()) return;

        const command = this.findCommand(interaction.commandName, 'INTERACTION_COMMAND');
        if (!command) return;

        const executeData: RecipleInteractionCommandExecuteData = {
            interaction: interaction,
            builder: command,
            client: this
        };

        if (userHasCommandPermissions(command.name, interaction.memberPermissions ?? undefined, this.config.permissions.interactionCommands, command)) {
            if (!command || isIgnoredChannel(interaction.channelId, this.config.ignoredChannels)) return;

            if (interaction.guild && botHasExecutePermissions(interaction.guild, command.requiredBotPermissions)) {
                if (!command.halt || !await command.halt({ executeData, reason: 'MISSING_BOT_PERMISSIONS' })) {
                    await interaction.reply(this.getMessage('insufficientBotPerms', 'Insufficient bot permissions.')).catch(er => this._replyError(er));
                }
                return;
            }

            const userCooldown: Omit<CooledDownUser, 'expireTime'> = {
                user: interaction.user,
                command: command.name,
                channel: interaction.channel ?? undefined,
                guild: interaction.guild,
                type: 'INTERACTION_COMMAND'
            };

            if (this.config.commands.interactionCommand.enableCooldown && command.cooldown && !this.commandCooldowns.isCooledDown(userCooldown)) {
                this.commandCooldowns.add({ ...userCooldown, expireTime: Date.now() + command.cooldown });
            } else if (this.config.commands.interactionCommand.enableCooldown && command.cooldown) {
                if (!command.halt || !await command.halt({ executeData, reason: 'COOLDOWN', ...this.commandCooldowns.get(userCooldown)! })) {
                    await interaction.reply(this.getMessage('cooldown', 'You cannot execute this command right now due to the cooldown.')).catch(er => this._replyError(er));
                }
                return;
            }

            try {
                await Promise.resolve(command.execute(executeData)).catch(async err => !command.halt || !await command.halt({ executeData, reason: 'ERROR', error: err }) ? this._commandExecuteError(err, executeData) : void 0);
                this.emit('recipleInteractionCommandCreate', executeData);
                return executeData;
            } catch (err) {
                if (!command.halt || !await command.halt({ executeData, reason: 'ERROR', error: err })) {
                    this._commandExecuteError(err as Error, executeData);
                }
            }
        } else if (!command.halt || !await command.halt({ executeData, reason: 'MISSING_MEMBER_PERMISSIONS' })) {
            await interaction.reply(this.getMessage('noPermissions', 'You do not have permission to use this command.')).catch(er => this._replyError(er));
        }
    }

    /**
     * Get a message from config 
     */
    public getMessage<T = unknown>(messageKey: string, defaultMessage?: T): T {
        return this.config.messages[messageKey] ?? defaultMessage ?? messageKey;
    }

    /**
     * Get command builder by name or alias if it's a message command 
     */
    public findCommand(command: string, type: MessageCommandBuilder["builder"]): MessageCommandBuilder|undefined;
    public findCommand(command: string, type: InteractionCommandBuilder["builder"]): InteractionCommandBuilder|undefined;
    public findCommand(command: string, type: RecipleCommandBuilders["builder"]): RecipleCommandBuilders|undefined {
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

    /**
     * Emits the "recipleReplyError" event
     */
    private _replyError(error: unknown) {
        this.emit('recipleReplyError', error);
    }

    /**
     * Error message when a command fails to execute
     */
    private async _commandExecuteError(err: Error, command: RecipleCommandBuildersExecuteData): Promise<void> {
        if (this.isClientLogsEnabled()) {
            this.logger.error(`An error occured executing ${command.builder.builder == 'MESSAGE_COMMAND' ? 'message' : 'interaction'} command "${command.builder.name}"`);
            this.logger.error(err);
        }

        if (!err || !command) return;

        if ((command as RecipleMessageCommandExecuteData)?.message) {
            if (!this.config.commands.messageCommand.replyOnError) return;
            await (command as RecipleMessageCommandExecuteData).message.reply(this.getMessage('error', 'An error occurred.')).catch(er => this._replyError(er));
        } else if ((command as RecipleInteractionCommandExecuteData)?.interaction) {
            if (!this.config.commands.interactionCommand.replyOnError) return;
            await (command as RecipleInteractionCommandExecuteData).interaction.followUp(this.getMessage('error', 'An error occurred.')).catch(er => this._replyError(er));
        }
    }
}
