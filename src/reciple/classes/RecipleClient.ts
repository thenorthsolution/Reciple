import { MessageCommandBuilder, MessageCommandExecuteData, MessageCommandHaltData, validateMessageCommandOptions } from './builders/MessageCommandBuilder';
import { Awaitable, ChannelType, ChatInputCommandInteraction, Client, ClientEvents, ClientOptions, Interaction, Message } from 'discord.js';
import { SlashCommandBuilder, SlashCommandExecuteData, SlashCommandHaltData } from './builders/SlashCommandBuilder';
import { AnyCommandExecuteData, AnyCommandHaltData, CommandHaltReason } from '../types/commands';
import { CommandCooldownManager, CooledDownUser } from './managers/CommandCooldownManager';
import { botHasExecutePermissions, userHasCommandPermissions } from '../permissions';
import { MessageCommandOptionManager } from './managers/MessageCommandOptionManager';
import { ApplicationCommandManager } from './managers/ApplicationCommandManager';
import { ClientCommandManager } from './managers/ClientCommandManager';
import { ClientModuleManager } from './managers/ClientModuleManager';
import { AnyCommandBuilder, CommandType } from '../types/builders';
import { Config, RecipleConfig } from './RecipleConfig';
import { getCommand, Logger } from 'fallout-utility';
import { createLogger } from '../util';
import { version } from '../version.js';
import { cwd } from '../flags';
import path from 'path';

/**
 * Options for {@link RecipleClient}
 */
export interface RecipleClientOptions extends ClientOptions {
    config?: Config;
    cwd?: string;
}

/**
 * Reciple client events
 */
export interface RecipleClientEvents extends ClientEvents {
    recipleCommandExecute: [executeData: AnyCommandExecuteData];
    recipleCommandHalt: [haltData: AnyCommandHaltData];
    recipleRegisterApplicationCommands: [];
    recipleReplyError: [error: unknown];
}

/**
 * Reciple client
 */
export interface RecipleClient<Ready extends boolean = boolean> extends Client<Ready> {
    on<E extends keyof RecipleClientEvents>(event: E, listener: (...args: RecipleClientEvents[E]) => Awaitable<void>): this;
    on<E extends string | symbol>(event: E, listener: (...args: any) => Awaitable<void>): this;

    once<E extends keyof RecipleClientEvents>(event: E, listener: (...args: RecipleClientEvents[E]) => Awaitable<void>): this;
    once<E extends keyof string | symbol>(event: E, listener: (...args: any) => Awaitable<void>): this;

    emit<E extends keyof RecipleClientEvents>(event: E, ...args: RecipleClientEvents[E]): boolean;
    emit<E extends string | symbol>(event: E, ...args: any): boolean;

    off<E extends keyof RecipleClientEvents>(event: E, listener: (...args: RecipleClientEvents[E]) => Awaitable<void>): this;
    off<E extends string | symbol>(event: E, listener: (...args: any) => Awaitable<void>): this;

    removeAllListeners<E extends keyof RecipleClientEvents>(event?: E): this;
    removeAllListeners(event?: string | symbol): this;

    isReady(): this is RecipleClient<true>;
}

export class RecipleClient<Ready extends boolean = boolean> extends Client<Ready> {
    readonly config: Config = RecipleConfig.getDefaultConfig();
    readonly commands: ClientCommandManager = new ClientCommandManager({
        client: this,
    });
    readonly applicationCommands: ApplicationCommandManager;
    readonly cooldowns: CommandCooldownManager = new CommandCooldownManager();
    readonly modules: ClientModuleManager = new ClientModuleManager({
        client: this,
    });
    readonly cwd: string;
    readonly logger: Logger;
    readonly version: string = version;

    get isClientLogsSilent() {
        return !this.config.fileLogging.clientLogs;
    }

    /**
     * @param options Client options
     */
    constructor(options: RecipleClientOptions) {
        super(options);

        this.logger = createLogger(!!options.config?.fileLogging.stringifyLoggedJSON, options.config?.fileLogging.debugmode);
        this.config = { ...this.config, ...(options.config ?? {}) };

        if (this.config.fileLogging.enabled) this.logger.logFile(path.join(cwd, this.config.fileLogging.logFilePath ?? 'logs/latest.log'), false);

        this.cwd = options.cwd ?? process.cwd();
        this.applicationCommands = new ApplicationCommandManager(this);
    }

    /**
     * Listed to command executions
     */
    public addCommandListeners(): RecipleClient<Ready> {
        this.on('messageCreate', message => {
            if (this.config.commands.messageCommand.enabled) this.messageCommandExecute(message);
        });

        this.on('interactionCreate', interaction => {
            if (this.config.commands.slashCommand.enabled) this.slashCommandExecute(interaction);
        });

        return this;
    }

    /**
     * Execute a slash command
     * @param interaction Slash command interaction
     */
    public async slashCommandExecute(interaction: Interaction | ChatInputCommandInteraction): Promise<undefined | SlashCommandExecuteData> {
        if (!interaction || !interaction.isChatInputCommand() || !this.isReady()) return;
        if (!this.config.commands.slashCommand.acceptRepliedInteractions && (interaction.replied || interaction.deferred)) return;

        const command = this.commands.get(interaction.commandName, CommandType.SlashCommand);
        if (!command) return;

        const executeData: SlashCommandExecuteData = {
            interaction,
            builder: command,
            client: this,
        };

        if (
            userHasCommandPermissions({
                builder: command,
                memberPermissions: interaction.memberPermissions ?? undefined,
                commandPermissions: this.config.commands.slashCommand.permissions,
            })
        ) {
            if (!command) return;
            if (interaction.inCachedGuild() && !botHasExecutePermissions(interaction.channel! || interaction.guild, command.requiredBotPermissions)) {
                if (
                    !(await this._haltCommand(command, {
                        executeData,
                        reason: CommandHaltReason.MissingBotPermissions,
                    }))
                ) {
                    await interaction.reply(this.getConfigMessage('insufficientBotPerms', 'Insufficient bot permissions.')).catch(er => this._replyError(er));
                }

                return;
            }

            const userCooldown: Omit<CooledDownUser, 'expireTime'> = {
                user: interaction.user,
                command: command.name,
                channel: interaction.channel ?? undefined,
                guild: interaction.guild,
                type: CommandType.SlashCommand,
            };

            if (this.config.commands.slashCommand.enableCooldown && command.cooldown && !this.cooldowns.isCooledDown(userCooldown)) {
                this.cooldowns.add({
                    ...userCooldown,
                    expireTime: Date.now() + command.cooldown,
                });
            } else if (this.config.commands.slashCommand.enableCooldown && command.cooldown) {
                if (
                    !(await this._haltCommand(command, {
                        executeData,
                        reason: CommandHaltReason.Cooldown,
                        ...this.cooldowns.get(userCooldown)!,
                    }))
                ) {
                    await interaction.reply(this.getConfigMessage('cooldown', 'You cannot execute this command right now due to the cooldown.')).catch(er => this._replyError(er));
                }

                return;
            }

            return this._executeCommand(command, executeData);
        } else if (
            !(await this._haltCommand(command, {
                executeData,
                reason: CommandHaltReason.MissingMemberPermissions,
            }))
        ) {
            await interaction.reply(this.getConfigMessage('noPermissions', 'You do not have permission to use this command.')).catch(er => this._replyError(er));
        }
    }

    /**
     * Execute a Message command
     * @param message Message command executor
     * @param prefix Message command prefix
     */
    public async messageCommandExecute(message: Message, prefix?: string): Promise<undefined | MessageCommandExecuteData> {
        if (!message.content || !this.isReady()) return;

        const parseCommand = getCommand(message.content, prefix || this.config.commands.messageCommand.prefix || '!', this.config.commands.messageCommand.commandArgumentSeparator || ' ');
        if (!parseCommand || !parseCommand?.command) return;

        const command = this.commands.get(parseCommand.command, CommandType.MessageCommand);
        if (!command) return;

        const commandOptions = await validateMessageCommandOptions(command, parseCommand);
        const executeData: MessageCommandExecuteData = {
            message: message,
            options: commandOptions,
            command: parseCommand,
            builder: command,
            client: this,
        };

        if (
            userHasCommandPermissions({
                builder: command,
                memberPermissions: message.member?.permissions,
                commandPermissions: this.config.commands.messageCommand.permissions,
            })
        ) {
            if ((!command.allowExecuteInDM && message.channel.type === ChannelType.DM) || (!command.allowExecuteByBots && (message.author.bot || message.author.system))) return;
            if (command.validateOptions) {
                if (commandOptions.some(o => o.invalid)) {
                    if (
                        !(await this._haltCommand(command, {
                            executeData,
                            reason: CommandHaltReason.InvalidArguments,
                            invalidArguments: new MessageCommandOptionManager(...executeData.options.filter(o => o.invalid)),
                        }))
                    ) {
                        message.reply(this.getConfigMessage('invalidArguments', 'Invalid argument(s) given.')).catch(er => this._replyError(er));
                    }
                    return;
                }

                if (commandOptions.some(o => o.missing)) {
                    if (
                        !(await this._haltCommand(command, {
                            executeData,
                            reason: CommandHaltReason.MissingArguments,
                            missingArguments: new MessageCommandOptionManager(...executeData.options.filter(o => o.missing)),
                        }))
                    ) {
                        message.reply(this.getConfigMessage('missingArguments', 'Not enough arguments.')).catch(er => this._replyError(er));
                    }
                    return;
                }
            }

            if (message.inGuild() && !botHasExecutePermissions(message.channel || message.guild, command.requiredBotPermissions)) {
                if (
                    !(await this._haltCommand(command, {
                        executeData,
                        reason: CommandHaltReason.MissingBotPermissions,
                    }))
                ) {
                    message.reply(this.getConfigMessage('insufficientBotPerms', 'Insufficient bot permissions.')).catch(er => this._replyError(er));
                }
                return;
            }

            const userCooldown: Omit<CooledDownUser, 'expireTime'> = {
                user: message.author,
                command: command.name,
                channel: message.channel,
                guild: message.guild,
                type: CommandType.MessageCommand,
            };

            if (this.config.commands.messageCommand.enableCooldown && command.cooldown && !this.cooldowns.isCooledDown(userCooldown)) {
                this.cooldowns.add({
                    ...userCooldown,
                    expireTime: Date.now() + command.cooldown,
                });
            } else if (this.config.commands.messageCommand.enableCooldown && command.cooldown) {
                if (
                    !(await this._haltCommand(command, {
                        executeData,
                        reason: CommandHaltReason.Cooldown,
                        ...this.cooldowns.get(userCooldown)!,
                    }))
                ) {
                    await message.reply(this.getConfigMessage('cooldown', 'You cannot execute this command right now due to the cooldown.')).catch(er => this._replyError(er));
                }

                return;
            }

            return this._executeCommand(command, executeData);
        } else if (
            !(await this._haltCommand(command, {
                executeData,
                reason: CommandHaltReason.MissingMemberPermissions,
            }))
        ) {
            message.reply(this.getConfigMessage('noPermissions', 'You do not have permission to use this command.')).catch(er => this._replyError(er));
        }
    }

    /**
     * Get a message from config
     * @param messageKey Config messages key
     * @param defaultMessage Default message when the key does not exists
     */
    public getConfigMessage<T = unknown>(messageKey: string, defaultMessage?: T): T {
        return this.config.messages[messageKey] ?? defaultMessage ?? messageKey;
    }

    /**
     * Emits the {@link RecipleClientEvents["recipleReplyError"]} event
     * @param error Received Error
     */
    protected _replyError(error: unknown) {
        this.emit('recipleReplyError', error);
    }

    /**
     * Executes command halt function
     * @param command Halted command's builder
     * @param haltData Halted command's data
     */
    protected async _haltCommand(command: SlashCommandBuilder, haltData: SlashCommandHaltData): Promise<boolean>;
    protected async _haltCommand(command: MessageCommandBuilder, haltData: MessageCommandHaltData): Promise<boolean>;
    protected async _haltCommand(command: AnyCommandBuilder, haltData: AnyCommandHaltData): Promise<boolean> {
        try {
            const haltResolved =
                (command.halt
                    ? await Promise.resolve(command.type == CommandType.SlashCommand ? command.halt(haltData as SlashCommandHaltData) : command.halt(haltData as MessageCommandHaltData)).catch(err => {
                          console.log(err);
                      })
                    : false) || false;

            this.emit('recipleCommandHalt', haltData);
            return haltResolved;
        } catch (err) {
            if (!this.isClientLogsSilent) {
                this.logger.error(`An error occured executing command halt for "${command.name}"`);
                this.logger.error(err);
            }
            return false;
        }
    }

    /**
     * Executes a command's {@link SharedCommandBuilderProperties["execute"]} method
     * @param command Command builder
     * @param executeData Command execute data
     */
    protected async _executeCommand(command: SlashCommandBuilder, executeData: SlashCommandExecuteData): Promise<SlashCommandExecuteData | undefined>;
    protected async _executeCommand(command: MessageCommandBuilder, executeData: MessageCommandExecuteData): Promise<MessageCommandExecuteData | undefined>;
    protected async _executeCommand(command: AnyCommandBuilder, executeData: AnyCommandExecuteData): Promise<AnyCommandExecuteData | undefined> {
        try {
            await Promise.resolve(command.type === CommandType.SlashCommand ? command.execute(executeData as SlashCommandExecuteData) : command.execute(executeData as MessageCommandExecuteData))
                .then(() => this.emit('recipleCommandExecute', executeData))
                .catch(async err =>
                    !(await this._haltCommand(command as any, {
                        executeData: executeData as any,
                        reason: CommandHaltReason.Error,
                        error: err,
                    }))
                        ? this._commandExecuteError(err as Error, executeData)
                        : void 0
                );

            return executeData;
        } catch (err) {
            if (
                await this._haltCommand(command as any, {
                    executeData: executeData as any,
                    reason: CommandHaltReason.Error,
                    error: err,
                })
            )
                return;
            await this._commandExecuteError(err as Error, executeData);
        }
    }

    /**
     * Error message when a command fails to execute
     * @param err Received error
     * @param command Slash/Message command execute data
     */
    protected async _commandExecuteError(err: Error, command: AnyCommandExecuteData): Promise<void> {
        if (!this.isClientLogsSilent) {
            this.logger.error(`An error occured executing ${command.builder.type == CommandType.MessageCommand ? 'message' : 'slash'} command "${command.builder.name}"`);
            this.logger.error(err);
        }

        if (!err || !command) return;

        if (SlashCommandBuilder.isSlashCommandExecuteData(command)) {
            if (!this.config.commands.slashCommand.replyOnError) return;
            await command.interaction.followUp(this.getConfigMessage('error', 'An error occurred.')).catch(er => this._replyError(er));
        } else if (MessageCommandBuilder.isMessageCommandExecuteData(command)) {
            if (!this.config.commands.messageCommand.replyOnError) return;
            await command.message.reply(this.getConfigMessage('error', 'An error occurred.')).catch(er => this._replyError(er));
        }
    }
}
