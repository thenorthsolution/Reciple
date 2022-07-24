// Not cool code
import { createLogger } from '../logger';
import { loadModules, RecipleModule } from '../modules';
import { botHasExecutePermissions, isIgnoredChannel, userHasCommandPermissions } from '../permissions';
import { InteractionBuilder, registerInteractionCommands } from '../registerInteractionCommands';
import { RecipleCommandBuilder, RecipleCommandBuildersExecuteData, RecipleCommandBuilderType } from '../types/builders';
import { RecipleHaltedCommandData, RecipleHaltedCommandReason } from '../types/commands';
import { RecipleAddModuleOptions } from '../types/paramOptions';
import { version } from '../version';
import { InteractionCommandBuilder, InteractionCommandExecuteData } from './builders/InteractionCommandBuilder';
import { MessageCommandBuilder, MessageCommandExecuteData, validateMessageCommandOptions } from './builders/MessageCommandBuilder';
import { CommandCooldownManager, CooledDownUser } from './CommandCooldownManager';
import { MessageCommandOptionManager } from './MessageCommandOptionManager';
import { Config, RecipleConfig } from './RecipleConfig';

import { ApplicationCommandData, Awaitable, ChannelType, ChatInputCommandInteraction, Client, ClientEvents, ClientOptions, Interaction, InteractionType, Message } from 'discord.js';
import { getCommand, Logger as ILogger } from 'fallout-utility';

/**
 * options for Reciple client
 */
export interface RecipleClientOptions extends ClientOptions { config?: Config; }

/**
 * Reciple client commands object interface
 */
export interface RecipleClientCommands {
    messageCommands: { [commandName: string]: MessageCommandBuilder };
    interactionCommands: { [commandName: string]: InteractionCommandBuilder };
}

/**
 * Reciple client events
 */
export interface RecipleClientEvents extends ClientEvents {
    recipleMessageCommandCreate: [executeData: MessageCommandExecuteData];
    recipleInteractionCommandCreate: [executeData: InteractionCommandExecuteData];
    recipleReplyError: [error: unknown];
}

/**
 * Create new Reciple client
 */
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
    public commands: RecipleClientCommands = { messageCommands: {}, interactionCommands: {} };
    public otherApplicationCommandData: (InteractionBuilder|ApplicationCommandData)[] = [];
    public commandCooldowns: CommandCooldownManager = new CommandCooldownManager();
    public modules: RecipleModule[] = [];
    public logger: ILogger;
    public version: string = version;

    /**
     * @param options Client options
     */
    constructor(options: RecipleClientOptions) {
        super(options);

        this.logger = createLogger(!!options.config?.fileLogging.stringifyLoggedJSON, !!options.config?.fileLogging.debugmode);

        if (!options.config) throw new Error('Config is not defined.');
        this.config = {...this.config, ...(options.config ?? {})};

        if (this.config.fileLogging.enabled) this.logger.logFile(this.config.fileLogging.logFilePath, false);
    }

    /**
     * Load modules from modules folder
     * @param folder Modules folder
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
            this.logger.info(`${Object.keys(this.commands.messageCommands).length} message commands loaded.`);
            this.logger.info(`${Object.keys(this.commands.interactionCommands).length} interaction commands loaded.`);
        }

        if (this.config.commands.interactionCommand.registerCommands) {
            await registerInteractionCommands({
                client: this,
                commands: [...Object.values(this.commands.interactionCommands), ...this.otherApplicationCommandData],
                guilds: this.config.commands.interactionCommand.guilds
            });
        }

        return this;
    }

    /**
     * Add module
     * @param options Module options
     */
    public async addModule(options: RecipleAddModuleOptions): Promise<void> {
        const { script } = options;
        const registerCommands = options.registerInteractionCommands;
        const info = options.moduleInfo;
        
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

        if (registerCommands) await registerInteractionCommands({
            client: this,
            commands: [...Object.values(this.commands.interactionCommands), ...this.otherApplicationCommandData],
            guilds: this.config.commands.interactionCommand.guilds
        });
    }

    /**
     * Add interaction or message command to client
     * @param command Interaction/Message command builder
     */
    public addCommand(command: RecipleCommandBuilder): RecipleClient<Ready> {
        if (command.builder === RecipleCommandBuilderType.MessageCommand) {
            this.commands.messageCommands[command.name] = command;
        } else if (command.builder === RecipleCommandBuilderType.InteractionCommand) {
            this.commands.interactionCommands[command.name] = command;
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
     * @param message Message command executor
     * @param prefix Message command prefix
     */
    public async messageCommandExecute(message: Message, prefix?: string): Promise<void|MessageCommandExecuteData> {
        if (!message.content || !this.isReady()) return;

        const parseCommand = getCommand(message.content, prefix || this.config.commands.messageCommand.prefix || '!', this.config.commands.messageCommand.commandArgumentSeparator || ' ');
        if (!parseCommand || !parseCommand?.command) return; 

        const command = this.findCommand(parseCommand.command, RecipleCommandBuilderType.MessageCommand);
        if (!command) return;
        
        const commandOptions = validateMessageCommandOptions(command, parseCommand);
        const executeData: MessageCommandExecuteData = {
            message: message,
            options: commandOptions,
            command: parseCommand,
            builder: command,
            client: this
        };

        if (userHasCommandPermissions(command.name, message.member?.permissions, this.config.commands.messageCommand.permissions, command)) {
            if (
                !command.allowExecuteInDM && message.channel.type === ChannelType.DM
                || !command.allowExecuteByBots
                && (message.author.bot ||message.author.system)
                || isIgnoredChannel(message.channelId, this.config.ignoredChannels)
            ) return;

            if (command.validateOptions) {
                if (commandOptions.some(o => o.invalid)) {
                    if (!command?.halt || !await command.halt({ executeData, reason: RecipleHaltedCommandReason.InvalidArguments, invalidArguments: new MessageCommandOptionManager(executeData.options.filter(o => o.invalid)) })) {
                        message.reply(this.getMessage('invalidArguments', 'Invalid argument(s) given.')).catch(er => this._replyError(er));
                    }
                    return;
                }

                if (commandOptions.some(o => o.missing)) {
                    if (await this._haltCommand(command, { executeData, reason: RecipleHaltedCommandReason.MissingArguments, missingArguments: new MessageCommandOptionManager(executeData.options.filter(o => o.missing)) })) {
                        message.reply(this.getMessage('missingArguments', 'Not enough arguments.')).catch(er => this._replyError(er));
                    }
                    return;
                }
            }

            if (message.guild && !botHasExecutePermissions(message.guild, command.requiredBotPermissions)) {
                if (await this._haltCommand(command, { executeData, reason: RecipleHaltedCommandReason.MissingBotPermissions })) {
                    message.reply(this.getMessage('insufficientBotPerms', 'Insufficient bot permissions.')).catch(er => this._replyError(er));
                }
                return;
            }

            const userCooldown: Omit<CooledDownUser, "expireTime"> = {
                user: message.author,
                command: command.name,
                channel: message.channel,
                guild: message.guild,
                type: RecipleCommandBuilderType.MessageCommand
            };

            if (this.config.commands.messageCommand.enableCooldown && command.cooldown && !this.commandCooldowns.isCooledDown(userCooldown)) {
                this.commandCooldowns.add({ ...userCooldown, expireTime: Date.now() + command.cooldown });
            } else if (this.config.commands.messageCommand.enableCooldown && command.cooldown) {
                if (await this._haltCommand(command, { executeData, reason: RecipleHaltedCommandReason.Cooldown, ...this.commandCooldowns.get(userCooldown)! })) {
                    await message.reply(this.getMessage('cooldown', 'You cannot execute this command right now due to the cooldown.')).catch(er => this._replyError(er));
                }

                return;
            }

            try {
                await Promise.resolve(command.execute(executeData))
                .then(() => this.emit('recipleMessageCommandCreate', executeData))
                .catch(async err => await this._haltCommand(command, { executeData, reason: RecipleHaltedCommandReason.Error, error: err }) ? this._commandExecuteError(err, executeData) : void 0);
                
                return executeData;
            } catch (err) {
                if (await this._haltCommand(command, { executeData, reason: RecipleHaltedCommandReason.Error, error: err })) {
                    this._commandExecuteError(err as Error, executeData);
                }
            }
        } else if (await this._haltCommand(command, { executeData, reason: RecipleHaltedCommandReason.MissingMemberPermissions })) {
            message.reply(this.getMessage('noPermissions', 'You do not have permission to use this command.')).catch(er => this._replyError(er));
        }
    }

    /**
     * Execute an Interaction command 
     * @param interaction Command Interaction
     */
    public async interactionCommandExecute(interaction: Interaction|ChatInputCommandInteraction): Promise<void|InteractionCommandExecuteData> {
        if (!interaction || interaction.type !== InteractionType.ApplicationCommand || !interaction.isChatInputCommand() || !this.isReady()) return;

        const command = this.findCommand(interaction.commandName, RecipleCommandBuilderType.InteractionCommand);
        if (!command) return;

        const executeData: InteractionCommandExecuteData = {
            interaction: interaction,
            builder: command,
            client: this
        };

        if (userHasCommandPermissions(command.name, interaction.memberPermissions ?? undefined, this.config.commands.interactionCommand.permissions, command)) {
            if (!command || isIgnoredChannel(interaction.channelId, this.config.ignoredChannels)) return;

            if (interaction.guild && !botHasExecutePermissions(interaction.guild, command.requiredBotPermissions)) {
                if (await this._haltCommand(command, { executeData, reason: RecipleHaltedCommandReason.MissingBotPermissions })) {
                    await interaction.reply(this.getMessage('insufficientBotPerms', 'Insufficient bot permissions.')).catch(er => this._replyError(er));
                }

                return;
            }

            const userCooldown: Omit<CooledDownUser, 'expireTime'> = {
                user: interaction.user,
                command: command.name,
                channel: interaction.channel ?? undefined,
                guild: interaction.guild,
                type: RecipleCommandBuilderType.InteractionCommand
            };

            if (this.config.commands.interactionCommand.enableCooldown && command.cooldown && !this.commandCooldowns.isCooledDown(userCooldown)) {
                this.commandCooldowns.add({ ...userCooldown, expireTime: Date.now() + command.cooldown });
            } else if (this.config.commands.interactionCommand.enableCooldown && command.cooldown) {
                if (await this._haltCommand(command, { executeData, reason: RecipleHaltedCommandReason.Cooldown, ...this.commandCooldowns.get(userCooldown)! })) {
                    await interaction.reply(this.getMessage('cooldown', 'You cannot execute this command right now due to the cooldown.')).catch(er => this._replyError(er));
                }

                return;
            }

            try {
                await Promise.resolve(command.execute(executeData))
                .then(() => this.emit('recipleInteractionCommandCreate', executeData))
                .catch(async err => await this._haltCommand(command, { executeData, reason: RecipleHaltedCommandReason.Error, error: err }) ? this._commandExecuteError(err, executeData) : void 0);

                return executeData;
            } catch (err) {
                if (await this._haltCommand(command, { executeData, reason: RecipleHaltedCommandReason.Error, error: err })) {
                    this._commandExecuteError(err as Error, executeData);
                }
            }
        } else if (await this._haltCommand(command, { executeData, reason: RecipleHaltedCommandReason.MissingMemberPermissions })) {
            await interaction.reply(this.getMessage('noPermissions', 'You do not have permission to use this command.')).catch(er => this._replyError(er));
        }
    }

    /**
     * Get a message from config 
     * @param messageKey Config messages key
     * @param defaultMessage Default message when the key does not exists
     */
    public getMessage<T = unknown>(messageKey: string, defaultMessage?: T): T {
        return this.config.messages[messageKey] ?? defaultMessage ?? messageKey;
    }

    /**
     * Get command builder by name or alias if it's a message command 
     * @param command Command name
     * @param type Command type
     */
    public findCommand(command: string, type: RecipleCommandBuilderType.MessageCommand): MessageCommandBuilder|undefined;
    public findCommand(command: string, type: RecipleCommandBuilderType.InteractionCommand): InteractionCommandBuilder|undefined;
    public findCommand(command: string, type: RecipleCommandBuilderType): RecipleCommandBuilder|undefined {
        switch (type) {
            case RecipleCommandBuilderType.InteractionCommand:
                return this.commands.interactionCommands[command];
            case RecipleCommandBuilderType.MessageCommand:
                return this.commands.messageCommands[command.toLowerCase()]
                    ?? (this.config.commands.messageCommand.allowCommandAlias
                        ? Object.values(this.commands.messageCommands).find(c => c.aliases.some(a => a == command?.toLowerCase()))
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
     * @param error Received Error
     */
    private _replyError(error: unknown) {
        this.emit('recipleReplyError', error);
    }

    /**
     * Executes command halt function
     * @param command Halted command's builder
     * @param haltData Halted command's data
     */
    private async _haltCommand(command: InteractionCommandBuilder, haltData: RecipleHaltedCommandData<InteractionCommandBuilder>): Promise<boolean>;
    private async _haltCommand(command: MessageCommandBuilder, haltData: RecipleHaltedCommandData<MessageCommandBuilder>): Promise<boolean>;
    private async _haltCommand(command: RecipleCommandBuilder, haltData: RecipleHaltedCommandData): Promise<boolean> {
        try {
            return (
                command.halt
                    ? await (command.builder == RecipleCommandBuilderType.InteractionCommand
                            ? Promise.resolve(command.halt(haltData as RecipleHaltedCommandData<InteractionCommandBuilder>))
                            : Promise.resolve(command.halt(haltData as RecipleHaltedCommandData<MessageCommandBuilder>))
                    ).catch(() => false)
                    : false
                ) ?? false;
        } catch (err) {
            if (this.isClientLogsEnabled()) {
                this.logger.error(`Halt command "${command.name}" execute error`);
                this.logger.error(err);
            }
            return false;
        }
    }

    /**
     * Error message when a command fails to execute
     * @param err Received error
     * @param command Interaction/Message command execute data
     */
    private async _commandExecuteError(err: Error, command: RecipleCommandBuildersExecuteData): Promise<void> {
        if (this.isClientLogsEnabled()) {
            this.logger.error(`An error occured executing ${command.builder.builder == RecipleCommandBuilderType.MessageCommand ? 'message' : 'interaction'} command "${command.builder.name}"`);
            this.logger.error(err);
        }

        if (!err || !command) return;

        if ((command as MessageCommandExecuteData)?.message) {
            if (!this.config.commands.messageCommand.replyOnError) return;
            await (command as MessageCommandExecuteData).message.reply(this.getMessage('error', 'An error occurred.')).catch(er => this._replyError(er));
        } else if ((command as InteractionCommandExecuteData)?.interaction) {
            if (!this.config.commands.interactionCommand.replyOnError) return;
            await (command as InteractionCommandExecuteData).interaction.followUp(this.getMessage('error', 'An error occurred.')).catch(er => this._replyError(er));
        }
    }
}
