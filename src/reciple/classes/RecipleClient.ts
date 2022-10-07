import { MessageCommandBuilder, MessageCommandExecuteData, MessageCommandHaltData, validateMessageCommandOptions } from './builders/MessageCommandBuilder';
import { SlashCommandBuilder, SlashCommandExecuteData, SlashCommandHaltData } from './builders/SlashCommandBuilder';
import { AnyCommandBuilder, AnyCommandData, AnySlashCommandBuilder, CommandBuilderType } from '../types/builders';
import { ApplicationCommandBuilder, registerApplicationCommands } from '../registerApplicationCommands';
import { AnyCommandExecuteData, AnyCommandHaltData, CommandHaltReason } from '../types/commands';
import { botHasExecutePermissions, userHasCommandPermissions } from '../permissions';
import { CommandCooldownManager, CooledDownUser } from './CommandCooldownManager';
import { MessageCommandOptionManager } from './MessageCommandOptionManager';
import { RecipleClientAddModuleOptions } from '../types/paramOptions';
import { Config, RecipleConfig } from './RecipleConfig';
import { getModules, RecipleModule } from '../modules';
import { getCommand, Logger } from 'fallout-utility';
import { createLogger } from '../logger';
import { version } from '../version';
import { cwd } from '../flags';
import path from 'path';

import {
    ApplicationCommandData,
    Awaitable,
    ChannelType,
    ChatInputCommandInteraction,
    Client,
    ClientEvents,
    ClientOptions,
    Collection,
    Interaction,
    Message,
    normalizeArray,
    RestOrArray
} from 'discord.js';
import { deprecationWarning } from '../util';

/**
 * Options for {@link RecipleClient}
 */
export interface RecipleClientOptions extends ClientOptions { config?: Config; }

/**
 * Reciple client commands
 */
export interface RecipleClientCommands {
    /**
     * Collection of loaded slash commands
     */
    slashCommands: Collection<string, AnySlashCommandBuilder>;
    /**
     * Collection of loaded message commands
     */
    messageCommands: Collection<string, MessageCommandBuilder>;
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
    on<E extends string|symbol>(event: E, listener: (...args: any) => Awaitable<void>): this;

    once<E extends keyof RecipleClientEvents>(event: E, listener: (...args: RecipleClientEvents[E]) => Awaitable<void>): this;
    once<E extends keyof string|symbol>(event: E, listener: (...args: any) => Awaitable<void>): this;

    emit<E extends keyof RecipleClientEvents>(event: E, ...args: RecipleClientEvents[E]): boolean;
    emit<E extends string|symbol>(event: E, ...args: any): boolean;

    off<E extends keyof RecipleClientEvents>(event: E, listener: (...args: RecipleClientEvents[E]) => Awaitable<void>): this;
    off<E extends string|symbol>(event: E, listener: (...args: any) => Awaitable<void>): this;

    removeAllListeners<E extends keyof RecipleClientEvents>(event?: E): this;
    removeAllListeners(event?: string|symbol): this;

    isReady(): this is RecipleClient<true>;
}

export class RecipleClient<Ready extends boolean = boolean> extends Client<Ready> {
    public config: Config = RecipleConfig.getDefaultConfig();
    public commands: RecipleClientCommands = { slashCommands: new Collection(), messageCommands: new Collection() };
    public additionalApplicationCommands: (ApplicationCommandBuilder|ApplicationCommandData)[] = [];
    public cooldowns: CommandCooldownManager = new CommandCooldownManager();
    public modules: RecipleModule[] = [];
    public logger: Logger;
    public version: string = version;

    /**
     * @param options Client options
     */
    constructor(options: RecipleClientOptions) {
        super(options);

        this.logger = createLogger(!!options.config?.fileLogging.stringifyLoggedJSON, options.config?.fileLogging.debugmode);
        this.config = {...this.config, ...(options.config ?? {})};

        if (this.config.fileLogging.enabled) this.logger.logFile(path.join(cwd, this.config.fileLogging.logFilePath ?? 'logs/latest.log'), false);
    }

    /**
     * Load and start modules from given folders
     * @param folders folders that contains the modules you want to load
     */
    public async startModules(...folders: RestOrArray<string>): Promise<this> {
        folders = normalizeArray(folders).map(f => path.join(cwd, f));

        for (const folder of folders) {
            if (this.isClientLogsEnabled()) this.logger.info(`Loading Modules from ${folder}`);

            const modules = await getModules(this, folder).catch(() => null);
            if (!modules) {
                if (this.isClientLogsEnabled()) this.logger.error(`Failed to load modules from ${folder}`);
                continue;
            }

            this.modules.push(...modules.modules);
        }

        return this;
    }

    /**
     * Execute {@link RecipleModule['onLoad']} from client modules and register application commands if enabled
     */
    public async loadModules(): Promise<this> {
        if (!this.isReady()) throw new Error('Client is not ready');

        for (const m in this.modules) {
            const index = <unknown>(m) as number;
            const module_ = this.modules[index];

            try {
                if (typeof module_.script?.onLoad === 'function') {
                    await Promise.resolve(module_.script.onLoad(this)).catch(err => {
                        if (this.isClientLogsEnabled()) {
                            this.logger.error(`Error loading ${module_.info.filename ?? 'unknown module'}:`);
                            this.logger.error(err);
                        }

                        this.modules.splice(index);
                    });
                }
            } catch (err) {
                if (this.isClientLogsEnabled()) {
                    this.logger.error(`Error loading ${module_.info.filename ?? 'unknown module'}:`);
                    this.logger.error(err);
                }

                this.modules.splice(index);
            }

            if (module_.script?.commands && Array.isArray(module_.script?.commands)) {
                for (const command of module_.script.commands) {
                    this.addCommand(command);
                }
            }
        }

        if (this.isClientLogsEnabled()) {
            this.logger.info(`${this.modules.length} modules loaded.`);
            this.logger.info(`${this.commands.messageCommands.size} message commands loaded.`);
            this.logger.info(`${this.commands.slashCommands.size} slash commands loaded.`);
        }

        if (this.config.commands.slashCommand.registerCommands) await this.registerClientApplicationCommands();

        return this;
    }

    /**
     * Add module
     * @param options Module options
     * @deprecated This is very stupid, Just add it manually
     */
    public async addModule(options: RecipleClientAddModuleOptions): Promise<void> {
        deprecationWarning('Add modules manually It\'s not that hard');
        // TODO: DEPRECATED!

        const { script } = options;
        const registerCommands = options.registerApplicationCommands;
        const info = options.moduleInfo;

        if (!this.isReady()) throw new Error('Client is not ready');

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

        if (registerCommands) await this.registerClientApplicationCommands();
    }

    /**
     * Add slash or message command to client
     * @param command Slash/Message command builder
     */
    public addCommand(command: AnyCommandData|AnyCommandBuilder): RecipleClient<Ready> {
        if (command.type === CommandBuilderType.SlashCommand) {
            this.commands.slashCommands.set(command.name, SlashCommandBuilder.resolveSlashCommand(command));
        } else if (command.type === CommandBuilderType.MessageCommand) {
            this.commands.messageCommands.set(command.name, MessageCommandBuilder.resolveMessageCommand(command));
        } else if (this.isClientLogsEnabled()) {
            this.logger.error(`Unknow command "${typeof command ?? 'unknown'}".`);
        }

        return this;
    }

    /**
     * Listed to command executions
     */
    public addCommandListeners(): RecipleClient<Ready> {
        this.on('messageCreate', (message) => {
            if (this.config.commands.messageCommand.enabled) this.messageCommandExecute(message);
        });

        this.on('interactionCreate', (interaction) => {
            if (this.config.commands.slashCommand.enabled) this.slashCommandExecute(interaction);
        });

        return this;
    }

    /**
     * Execute a slash command
     * @param interaction Slash command interaction
     */
    public async slashCommandExecute(interaction: Interaction|ChatInputCommandInteraction): Promise<void|SlashCommandExecuteData> {
        if (!interaction || !interaction.isChatInputCommand() || !this.isReady()) return;
        if (!this.config.commands.slashCommand.acceptRepliedInteractions && (interaction.replied || interaction.deferred)) return;

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
            if (!command) return;
            if (interaction.inCachedGuild() && !botHasExecutePermissions(interaction.channel! || interaction.guild, command.requiredBotPermissions)) {
                if (!await this._haltCommand(command, { executeData, reason: CommandHaltReason.MissingBotPermissions })) {
                    await interaction.reply(this.getConfigMessage('insufficientBotPerms', 'Insufficient bot permissions.')).catch(er => this._replyError(er));
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

            if (this.config.commands.slashCommand.enableCooldown && command.cooldown && !this.cooldowns.isCooledDown(userCooldown)) {
                this.cooldowns.add({ ...userCooldown, expireTime: Date.now() + command.cooldown });
            } else if (this.config.commands.slashCommand.enableCooldown && command.cooldown) {
                if (!await this._haltCommand(command, { executeData, reason: CommandHaltReason.Cooldown, ...this.cooldowns.get(userCooldown)! })) {
                    await interaction.reply(this.getConfigMessage('cooldown', 'You cannot execute this command right now due to the cooldown.')).catch(er => this._replyError(er));
                }

                return;
            }

           return this._executeCommand(command, executeData);
        } else if (!await this._haltCommand(command, { executeData, reason: CommandHaltReason.MissingMemberPermissions })) {
            await interaction.reply(this.getConfigMessage('noPermissions', 'You do not have permission to use this command.')).catch(er => this._replyError(er));
        }
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
            if (!command.allowExecuteInDM && message.channel.type === ChannelType.DM || !command.allowExecuteByBots && (message.author.bot ||message.author.system)) return;
            if (command.validateOptions) {
                if (commandOptions.some(o => o.invalid)) {
                    if (!await this._haltCommand(command, { executeData, reason: CommandHaltReason.InvalidArguments, invalidArguments: new MessageCommandOptionManager(...executeData.options.filter(o => o.invalid)) })) {
                        message.reply(this.getConfigMessage('invalidArguments', 'Invalid argument(s) given.')).catch(er => this._replyError(er));
                    }
                    return;
                }

                if (commandOptions.some(o => o.missing)) {
                    if (!await this._haltCommand(command, { executeData, reason: CommandHaltReason.MissingArguments, missingArguments: new MessageCommandOptionManager(...executeData.options.filter(o => o.missing)) })) {
                        message.reply(this.getConfigMessage('missingArguments', 'Not enough arguments.')).catch(er => this._replyError(er));
                    }
                    return;
                }
            }

            if (message.inGuild() && !botHasExecutePermissions(message.channel || message.guild, command.requiredBotPermissions)) {
                if (!await this._haltCommand(command, { executeData, reason: CommandHaltReason.MissingBotPermissions })) {
                    message.reply(this.getConfigMessage('insufficientBotPerms', 'Insufficient bot permissions.')).catch(er => this._replyError(er));
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

            if (this.config.commands.messageCommand.enableCooldown && command.cooldown && !this.cooldowns.isCooledDown(userCooldown)) {
                this.cooldowns.add({ ...userCooldown, expireTime: Date.now() + command.cooldown });
            } else if (this.config.commands.messageCommand.enableCooldown && command.cooldown) {
                if (!await this._haltCommand(command, { executeData, reason: CommandHaltReason.Cooldown, ...this.cooldowns.get(userCooldown)! })) {
                    await message.reply(this.getConfigMessage('cooldown', 'You cannot execute this command right now due to the cooldown.')).catch(er => this._replyError(er));
                }

                return;
            }

            return this._executeCommand(command, executeData);
        } else if (!await this._haltCommand(command, { executeData, reason: CommandHaltReason.MissingMemberPermissions })) {
            message.reply(this.getConfigMessage('noPermissions', 'You do not have permission to use this command.')).catch(er => this._replyError(er));
        }
    }

    /**
     * Registers client slash commands and other application commands
     */
    public async registerClientApplicationCommands(): Promise<void> {
        await registerApplicationCommands({
            client: this,
            commands: [...this.commands.slashCommands.toJSON(), ...this.additionalApplicationCommands],
            guilds: this.config.commands.slashCommand.guilds
        });

        this.emit('recipleRegisterApplicationCommands');
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
     * Get command builder by name or alias if it's a message command 
     * @param command Command name
     * @param type Command type
     */
    public findCommand(command: string, type: CommandBuilderType.MessageCommand): MessageCommandBuilder|undefined;
    public findCommand(command: string, type: CommandBuilderType.SlashCommand): SlashCommandBuilder|undefined;
    public findCommand(command: string, type: CommandBuilderType): AnyCommandBuilder|undefined {
        switch (type) {
            case CommandBuilderType.SlashCommand:
                return this.commands.slashCommands.get(command);
            case CommandBuilderType.MessageCommand:
                return this.commands.messageCommands.get(command.toLowerCase())
                    ?? (this.config.commands.messageCommand.allowCommandAlias
                        ? this.commands.messageCommands.find(c => c.aliases.some(a => a == command?.toLowerCase()))
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
            const haltResolved = (
                    command.halt
                        ? await Promise.resolve(
                            command.type == CommandBuilderType.SlashCommand
                                ? command.halt(haltData as SlashCommandHaltData)
                                : command.halt(haltData as MessageCommandHaltData)
                        ).catch(err => { console.log(err); })
                        : false
                ) || false;

            this.emit('recipleCommandHalt', haltData);
            return haltResolved;
        } catch (err) {
            if (this.isClientLogsEnabled()) {
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
    protected async _executeCommand(command: SlashCommandBuilder, executeData: SlashCommandExecuteData): Promise<SlashCommandExecuteData|void>;
    protected async _executeCommand(command: MessageCommandBuilder, executeData: MessageCommandExecuteData): Promise<MessageCommandExecuteData|void>;
    protected async _executeCommand(command: AnyCommandBuilder, executeData: AnyCommandExecuteData): Promise<AnyCommandExecuteData|void> {
        try {
            await Promise.resolve(
                command.type === CommandBuilderType.SlashCommand
                    ? command.execute(executeData as SlashCommandExecuteData)
                    : command.execute(executeData as MessageCommandExecuteData)
            )
            .then(() => this.emit('recipleCommandExecute', executeData))
            .catch(async err => 
                !await this._haltCommand(command as any, { executeData: executeData as any, reason: CommandHaltReason.Error, error: err })
                    ? this._commandExecuteError(err as Error, executeData)
                    : void 0
            );

            return executeData;
        } catch (err) {
            if (await this._haltCommand(command as any, { executeData: executeData as any, reason: CommandHaltReason.Error, error: err })) return;
            await this._commandExecuteError(err as Error, executeData);
        }
    }

    /**
     * Error message when a command fails to execute
     * @param err Received error
     * @param command Slash/Message command execute data
     */
    protected async _commandExecuteError(err: Error, command: AnyCommandExecuteData): Promise<void> {
        if (this.isClientLogsEnabled()) {
            this.logger.error(`An error occured executing ${command.builder.type == CommandBuilderType.MessageCommand ? 'message' : 'slash'} command "${command.builder.name}"`);
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
