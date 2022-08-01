import { MessageCommandBuilder, MessageCommandExecuteData, validateMessageCommandOptions } from './builders/MessageCommandBuilder';
import { botHasExecutePermissions, isIgnoredChannel, userHasCommandPermissions } from '../permissions';
import { ApplicationCommandBuilder, registerApplicationCommands } from '../registerApplicationCommands';
import { CommandBuilder, CommandBuilderExecuteData, CommandBuilderType } from '../types/builders';
import { SlashCommandBuilder, SlashCommandExecuteData } from './builders/SlashCommandBuilder';
import { CommandCooldownManager, CooledDownUser } from './CommandCooldownManager';
import { MessageCommandOptionManager } from './MessageCommandOptionManager';
import { HaltedCommandData, HaltedCommandReason } from '../types/commands';
import { RecipleClientAddModuleOptions } from '../types/paramOptions';
import { getCommand, Logger as ILogger } from 'fallout-utility';
import { Config, RecipleConfig } from './RecipleConfig';
import { loadModules, RecipleModule } from '../modules';
import { createLogger } from '../logger';
import { version } from '../version';

import {
    ApplicationCommandData,
    Awaitable,
    ChannelType,
    ChatInputCommandInteraction,
    Client,
    ClientEvents,
    ClientOptions,
    Interaction,
    InteractionType,
    Message
} from 'discord.js';

/**
 * options for Reciple client
 */
export interface RecipleClientOptions extends ClientOptions { config?: Config; }

/**
 * Reciple client commands object interface
 */
export interface RecipleClientCommands {
    messageCommands: { [commandName: string]: MessageCommandBuilder };
    slashCommands: { [commandName: string]: SlashCommandBuilder };
}

/**
 * Reciple client events
 */
export interface RecipleClientEvents extends ClientEvents {
    recipleMessageCommandCreate: [executeData: MessageCommandExecuteData];
    recipleInteractionCommandCreate: [executeData: SlashCommandExecuteData];
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
    public commands: RecipleClientCommands = { messageCommands: {}, slashCommands: {} };
    public otherApplicationCommandData: (ApplicationCommandBuilder|ApplicationCommandData)[] = [];
    public commandCooldowns: CommandCooldownManager = new CommandCooldownManager();
    public modules: RecipleModule[] = [];
    public logger: ILogger;
    public version: string = version;

    /**
     * @param options Client options
     */
    constructor(options: RecipleClientOptions) {
        super(options);

        this.logger = createLogger(!!options.config?.fileLogging.stringifyLoggedJSON, options.config?.fileLogging.debugmode);

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
     * Execute `onLoad()` from client modules and register application commands if enabled
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
            this.logger.info(`${Object.keys(this.commands.slashCommands).length} slash commands loaded.`);
        }

        if (this.config.commands.slashCommand.registerCommands) {
            await registerApplicationCommands({
                client: this,
                commands: [...Object.values(this.commands.slashCommands), ...this.otherApplicationCommandData],
                guilds: this.config.commands.slashCommand.guilds
            });
        }

        return this;
    }

    /**
     * Add module
     * @param options Module options
     */
    public async addModule(options: RecipleClientAddModuleOptions): Promise<void> {
        const { script } = options;
        const registerCommands = options.registerApplicationCommands;
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

        if (registerCommands) await registerApplicationCommands({
            client: this,
            commands: [...Object.values(this.commands.slashCommands), ...this.otherApplicationCommandData],
            guilds: this.config.commands.slashCommand.guilds
        });
    }

    /**
     * Add slash or message command to client
     * @param command Slash/Message command builder
     */
    public addCommand(command: CommandBuilder): RecipleClient<Ready> {
        if (command.builder === CommandBuilderType.MessageCommand) {
            this.commands.messageCommands[command.name] = command;
        } else if (command.builder === CommandBuilderType.SlashCommand) {
            this.commands.slashCommands[command.name] = command;
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
        if (this.config.commands.slashCommand.enabled) this.on('interactionCreate', (interaction) => { this.slashCommandExecute(interaction) });

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

        const command = this.findCommand(parseCommand.command, CommandBuilderType.MessageCommand);
        if (!command) return;
        
        const commandOptions = await validateMessageCommandOptions(command, parseCommand);
        const executeData: MessageCommandExecuteData = {
            message: message,
            options: commandOptions,
            command: parseCommand,
            builder: command,
            client: this
        };

        if (userHasCommandPermissions({
            builder: command,
            memberPermissions: message.member?.permissions,
            commandPermissions: this.config.commands.messageCommand.permissions
        })) {
            if (
                !command.allowExecuteInDM && message.channel.type === ChannelType.DM
                || !command.allowExecuteByBots
                && (message.author.bot ||message.author.system)
                || isIgnoredChannel(message.channelId, this.config.ignoredChannels)
            ) return;

            if (command.validateOptions) {
                if (commandOptions.some(o => o.invalid)) {
                    if (!await this._haltCommand(command, { executeData, reason: HaltedCommandReason.InvalidArguments, invalidArguments: new MessageCommandOptionManager(...executeData.options.filter(o => o.invalid)) })) {
                        message.reply(this.getMessage('invalidArguments', 'Invalid argument(s) given.')).catch(er => this._replyError(er));
                    }
                    return;
                }

                if (commandOptions.some(o => o.missing)) {
                    if (!await this._haltCommand(command, { executeData, reason: HaltedCommandReason.MissingArguments, missingArguments: new MessageCommandOptionManager(...executeData.options.filter(o => o.missing)) })) {
                        message.reply(this.getMessage('missingArguments', 'Not enough arguments.')).catch(er => this._replyError(er));
                    }
                    return;
                }
            }

            if (message.guild && !botHasExecutePermissions(message.guild, command.requiredBotPermissions)) {
                if (!await this._haltCommand(command, { executeData, reason: HaltedCommandReason.MissingBotPermissions })) {
                    message.reply(this.getMessage('insufficientBotPerms', 'Insufficient bot permissions.')).catch(er => this._replyError(er));
                }
                return;
            }

            const userCooldown: Omit<CooledDownUser, "expireTime"> = {
                user: message.author,
                command: command.name,
                channel: message.channel,
                guild: message.guild,
                type: CommandBuilderType.MessageCommand
            };

            if (this.config.commands.messageCommand.enableCooldown && command.cooldown && !this.commandCooldowns.isCooledDown(userCooldown)) {
                this.commandCooldowns.add({ ...userCooldown, expireTime: Date.now() + command.cooldown });
            } else if (this.config.commands.messageCommand.enableCooldown && command.cooldown) {
                if (!await this._haltCommand(command, { executeData, reason: HaltedCommandReason.Cooldown, ...this.commandCooldowns.get(userCooldown)! })) {
                    await message.reply(this.getMessage('cooldown', 'You cannot execute this command right now due to the cooldown.')).catch(er => this._replyError(er));
                }

                return;
            }

            try {
                await Promise.resolve(command.execute(executeData))
                .then(() => this.emit('recipleMessageCommandCreate', executeData))
                .catch(async err => await this._haltCommand(command, { executeData, reason: HaltedCommandReason.Error, error: err }) ? this._commandExecuteError(err, executeData) : void 0);
                
                return executeData;
            } catch (err) {
                if (!await this._haltCommand(command, { executeData, reason: HaltedCommandReason.Error, error: err })) {
                    this._commandExecuteError(err as Error, executeData);
                }
            }
        } else if (!await this._haltCommand(command, { executeData, reason: HaltedCommandReason.MissingMemberPermissions })) {
            message.reply(this.getMessage('noPermissions', 'You do not have permission to use this command.')).catch(er => this._replyError(er));
        }
    }

    /**
     * Execute a slash command 
     * @param interaction Slash command interaction
     */
    public async slashCommandExecute(interaction: Interaction|ChatInputCommandInteraction): Promise<void|SlashCommandExecuteData> {
        if (!interaction || !interaction.isChatInputCommand() || !this.isReady()) return;

        const command = this.findCommand(interaction.commandName, CommandBuilderType.SlashCommand);
        if (!command) return;

        const executeData: SlashCommandExecuteData = {
            interaction,
            builder: command,
            client: this
        };

        if (userHasCommandPermissions({
            builder: command,
            memberPermissions: interaction.memberPermissions ?? undefined,
            commandPermissions: this.config.commands.slashCommand.permissions
        })) {
            if (!command || isIgnoredChannel(interaction.channelId, this.config.ignoredChannels)) return;

            if (interaction.guild && !botHasExecutePermissions(interaction.guild, command.requiredBotPermissions)) {
                if (!await this._haltCommand(command, { executeData, reason: HaltedCommandReason.MissingBotPermissions })) {
                    await interaction.reply(this.getMessage('insufficientBotPerms', 'Insufficient bot permissions.')).catch(er => this._replyError(er));
                }

                return;
            }

            const userCooldown: Omit<CooledDownUser, 'expireTime'> = {
                user: interaction.user,
                command: command.name,
                channel: interaction.channel ?? undefined,
                guild: interaction.guild,
                type: CommandBuilderType.SlashCommand
            };

            if (this.config.commands.slashCommand.enableCooldown && command.cooldown && !this.commandCooldowns.isCooledDown(userCooldown)) {
                this.commandCooldowns.add({ ...userCooldown, expireTime: Date.now() + command.cooldown });
            } else if (this.config.commands.slashCommand.enableCooldown && command.cooldown) {
                if (!await this._haltCommand(command, { executeData, reason: HaltedCommandReason.Cooldown, ...this.commandCooldowns.get(userCooldown)! })) {
                    await interaction.reply(this.getMessage('cooldown', 'You cannot execute this command right now due to the cooldown.')).catch(er => this._replyError(er));
                }

                return;
            }

            try {
                await Promise.resolve(command.execute(executeData))
                .then(() => this.emit('recipleInteractionCommandCreate', executeData))
                .catch(async err => await this._haltCommand(command, { executeData, reason: HaltedCommandReason.Error, error: err }) ? this._commandExecuteError(err, executeData) : void 0);

                return executeData;
            } catch (err) {
                if (!await this._haltCommand(command, { executeData, reason: HaltedCommandReason.Error, error: err })) {
                    this._commandExecuteError(err as Error, executeData);
                }
            }
        } else if (!await this._haltCommand(command, { executeData, reason: HaltedCommandReason.MissingMemberPermissions })) {
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
    public findCommand(command: string, type: CommandBuilderType.MessageCommand): MessageCommandBuilder|undefined;
    public findCommand(command: string, type: CommandBuilderType.SlashCommand): SlashCommandBuilder|undefined;
    public findCommand(command: string, type: CommandBuilderType): CommandBuilder|undefined {
        switch (type) {
            case CommandBuilderType.SlashCommand:
                return this.commands.slashCommands[command];
            case CommandBuilderType.MessageCommand:
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
    private async _haltCommand(command: SlashCommandBuilder, haltData: HaltedCommandData<SlashCommandBuilder>): Promise<boolean>;
    private async _haltCommand(command: MessageCommandBuilder, haltData: HaltedCommandData<MessageCommandBuilder>): Promise<boolean>;
    private async _haltCommand(command: CommandBuilder, haltData: HaltedCommandData): Promise<boolean> {
        try {
            return (
                command.halt
                    ? await (command.builder == CommandBuilderType.SlashCommand
                            ? Promise.resolve(command.halt(haltData as HaltedCommandData<SlashCommandBuilder>))
                            : Promise.resolve(command.halt(haltData as HaltedCommandData<MessageCommandBuilder>))
                    ).catch(err => { throw err; })
                    : false
                ) ?? false;
        } catch (err) {
            if (this.isClientLogsEnabled()) {
                this.logger.error(`An error occured executing command halt for "${command.name}"`);
                this.logger.error(err);
            }
            return false;
        }
    }

    /**
     * Error message when a command fails to execute
     * @param err Received error
     * @param command Slash/Message command execute data
     */
    private async _commandExecuteError(err: Error, command: CommandBuilderExecuteData): Promise<void> {
        if (this.isClientLogsEnabled()) {
            this.logger.error(`An error occured executing ${command.builder.builder == CommandBuilderType.MessageCommand ? 'message' : 'slash'} command "${command.builder.name}"`);
            this.logger.error(err);
        }

        if (!err || !command) return;

        if ((command as MessageCommandExecuteData)?.message) {
            if (!this.config.commands.messageCommand.replyOnError) return;
            await (command as MessageCommandExecuteData).message.reply(this.getMessage('error', 'An error occurred.')).catch(er => this._replyError(er));
        } else if ((command as SlashCommandExecuteData)?.interaction) {
            if (!this.config.commands.slashCommand.replyOnError) return;
            await (command as SlashCommandExecuteData).interaction.followUp(this.getMessage('error', 'An error occurred.')).catch(er => this._replyError(er));
        }
    }
}
