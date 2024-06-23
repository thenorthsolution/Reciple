import { Collection, Message, isJSONEncodable, normalizeArray, type ApplicationCommand, type ApplicationCommandDataResolvable, type ChatInputCommandInteraction, type ContextMenuCommandInteraction, type JSONEncodable, type RESTPostAPIChatInputApplicationCommandsJSONBody, type RESTPostAPIContextMenuApplicationCommandsJSONBody, type RestOrArray } from 'discord.js';
import type { AnyCommandBuilder, AnyCommandExecuteData, AnyCommandHaltTriggerData, AnyCommandResolvable, RecipleClientConfig, RecipleClientInteractionBasedCommandConfigOptions } from '../../types/structures.js';
import { CommandPrecondition, type CommandPreconditionResolvable, type CommandPreconditionResultData } from '../structures/CommandPrecondition.js';
import { SlashCommandBuilder, type AnySlashCommandBuilder, type SlashCommandExecuteData } from '../builders/SlashCommandBuilder.js';
import { ContextMenuCommandBuilder, type ContextMenuCommandExecuteData } from '../builders/ContextMenuCommandBuilder.js';
import { CommandHalt, type CommandHaltResolvable, type CommandHaltResultData } from '../structures/CommandHalt.js';
import { MessageCommandBuilder, type MessageCommandExecuteData } from '../builders/MessageCommandBuilder.js';
import type { RecipleClient } from '../structures/RecipleClient.js';
import { CommandHaltReason, CommandType } from '../../types/constants.js';
import { RecipleError } from '../structures/RecipleError.js';
import { Utils } from '../structures/Utils.js';
import defaultsDeep from 'lodash.defaultsdeep';

export interface CommandManagerRegisterCommandsOptions extends Omit<Exclude<RecipleClientConfig['applicationCommandRegister'], undefined>, 'enabled'> {
    contextMenuCommands?: Partial<RecipleClientInteractionBasedCommandConfigOptions> & {
        commands?: (RESTPostAPIContextMenuApplicationCommandsJSONBody|JSONEncodable<RESTPostAPIContextMenuApplicationCommandsJSONBody>)[];
    };
    slashCommands?: Partial<RecipleClientInteractionBasedCommandConfigOptions> & {
        commands?: (RESTPostAPIChatInputApplicationCommandsJSONBody|JSONEncodable<RESTPostAPIChatInputApplicationCommandsJSONBody>)[];
    };
}

export class CommandManager {
    readonly contextMenuCommands: Collection<string, ContextMenuCommandBuilder> = new Collection();
    readonly messageCommands: Collection<string, MessageCommandBuilder> = new Collection();
    readonly slashCommands: Collection<string, AnySlashCommandBuilder> = new Collection();
    readonly preconditions: Collection<string, CommandPrecondition> = new Collection();
    readonly halts: Collection<string, CommandHalt> = new Collection();

    constructor(readonly client: RecipleClient<true>) {}

    get size() {
        return this.contextMenuCommands.size + this.messageCommands.size + this.slashCommands.size;
    }

    public getApplicationCommands(): (ContextMenuCommandBuilder|AnySlashCommandBuilder)[] {
        return [
            ...this.contextMenuCommands.values(),
            ...this.slashCommands.values()
        ];
    }

    /**
     * Adds preconditions to the global preconditions.
     * @param data Preconditions resolvable.
     */
    public addPreconditions(...data: RestOrArray<CommandPreconditionResolvable>): CommandPrecondition[] {
        const preconditions = normalizeArray(data).map(p => CommandPrecondition.resolve(p));

        for (const precondition of preconditions) {
            this.preconditions.set(precondition.id, precondition);
        }

        return preconditions;
    }

    /**
     * Sets the preconditions in global preconditions.
     * @param data Preconditions resolvable.
     */
    public setPreconditions(...data: RestOrArray<CommandPreconditionResolvable>): CommandPrecondition[] {
        this.preconditions.clear();
        return this.addPreconditions(normalizeArray(data));
    }

    /**
     * Executes a preconditions for a command.
     * @param executeData Execute data of the command.
     */
    public async executePreconditions<T extends AnyCommandExecuteData = AnyCommandExecuteData>(executeData: T): Promise<CommandPreconditionResultData<T>|null> {
        const preconditions = Array.from(this.preconditions.values());
        const disabledPreconditions = executeData.builder.disabled_preconditions;

        for (const precondition of executeData.builder.preconditions) {
            const data = CommandPrecondition.resolve(precondition);
            if (preconditions.some(p => p.id === data.id) || disabledPreconditions.includes(data.id)) continue;

            preconditions.push(data);
        }

        for (const precondition of preconditions) {
            if (precondition.disabled || disabledPreconditions.some(p => p === precondition.id)) continue;

            const data = await precondition.execute(executeData);
            if (!data.successful) return data;
        }

        return null;
    }

    /**
     * Adds halt to the global halts.
     * @param data Halts resolvable.
     */
    public addHalts(...data: RestOrArray<CommandHaltResolvable>): CommandHalt[] {
        const halts = normalizeArray(data).map(h => CommandHalt.resolve(h));

        for (const halt of halts) {
            this.halts.set(halt.id, halt);
        }

        return halts;
    }

    /**
     * Sets halts in global halts.
     * @param data Halts resolvable.
     */
    public setHalts(...data: RestOrArray<CommandHaltResolvable>): CommandHalt[] {
        this.halts.clear();
        return this.addHalts(normalizeArray(data));
    }

    /**
     * Executes a halt for a command.
     * @param trigger Trigger data of the command.
     */
    public async executeHalts<T extends AnyCommandHaltTriggerData = AnyCommandHaltTriggerData>(trigger: T): Promise<CommandHaltResultData<T['commandType']>|boolean> {
        const halts: CommandHalt[] = [];
        const disabledHalts = trigger.executeData.builder.disabled_halts;

        for (const halt of trigger.executeData.builder.halts) {
            const data = CommandHalt.resolve(halt);
            if (halts.some(p => p.id === data.id)  || disabledHalts.includes(data.id)) continue;

            halts.push(data);
        }

        halts.push(...this.halts.values());

        let handled = false;

        for (const halt of halts) {
            if (halt.disabled || disabledHalts.some(p => p === halt.id)) continue;

            const data = await halt.execute(trigger);
            if (data === null) continue;
            if (!data.successful) return data;

            handled = true;
        }

        return handled;
    }

    public get(command: string, type: CommandType.ContextMenuCommand): ContextMenuCommandBuilder|undefined;
    public get(command: string, type: CommandType.MessageCommand): MessageCommandBuilder|undefined;
    public get(command: string, type: CommandType.SlashCommand): AnySlashCommandBuilder|undefined;
    public get(command: string, type: CommandType): AnyCommandBuilder|undefined {
        switch (type) {
            case CommandType.ContextMenuCommand:
                return this.contextMenuCommands.get(command);
            case CommandType.MessageCommand:
                return (this.messageCommands.get(command) ?? this.messageCommands.find(c => c.aliases?.some(a => a == command?.toLowerCase())));
            case CommandType.SlashCommand:
                return this.slashCommands.get(command);
        }
    }

    /**
     * Adds new command to the manager.
     * @param commands Any command resolvable.
     */
    public add(...commands: RestOrArray<AnyCommandResolvable>): AnyCommandBuilder[] {
        const resolved = normalizeArray(commands).map(c => Utils.resolveCommandBuilder(c));

        for (const command of resolved) {
            switch (command.command_type) {
                case CommandType.ContextMenuCommand:
                    this.contextMenuCommands.set(command.name, command);
                    break;
                case CommandType.MessageCommand:
                    this.messageCommands.set(command.name, command);
                    break;
                case CommandType.SlashCommand:
                    this.slashCommands.set(command.name, command);
                    break;
            }
        }

        return resolved;
    }

    /**
     * Registers the application commands.
     * @param options Register application commands options.
     */
    public async registerApplicationCommands(options?: CommandManagerRegisterCommandsOptions): Promise<{ global: Collection<string, ApplicationCommand>; guilds: Collection<string, Collection<string, ApplicationCommand>> }> {
        const store = { global: new Collection<string, ApplicationCommand>(), guilds: new Collection<string, Collection<string, ApplicationCommand>>() };
        const config = defaultsDeep({ ...this.client.config.commands, ...this.client.config.applicationCommandRegister }, options) as CommandManagerRegisterCommandsOptions;

        const contextMenuCommands = (options?.contextMenuCommands?.commands ?? Array.from(this.contextMenuCommands.values())).map(c => isJSONEncodable(c) ? c.toJSON() : c);
        const slashCommands = (options?.slashCommands?.commands ?? Array.from(this.slashCommands.values())).map(c => isJSONEncodable(c) ? c.toJSON() : c);

        const globalCommands: ApplicationCommandDataResolvable[] = [];
        const guildCommands: Collection<string, Set<ApplicationCommandDataResolvable>> = new Collection();

        if (config.allowRegisterGlobally !== false) {
            if (config.contextMenuCommands?.registerCommands?.registerGlobally !== false) globalCommands.push(...contextMenuCommands);
            if (config.slashCommands?.registerCommands?.registerGlobally !== false) globalCommands.push(...slashCommands);
        }

        if (config.allowRegisterToGuilds) {
            for (const guildId of config.contextMenuCommands?.registerCommands?.registerToGuilds ?? []) {
                const commands = guildCommands.get(guildId) ?? guildCommands.set(guildId, new Set()).get(guildId)!;
                contextMenuCommands.forEach(c => commands.add(c));
            }

            for (const guildId of config.slashCommands?.registerCommands?.registerToGuilds ?? []) {
                const commands = guildCommands.get(guildId) ?? guildCommands.set(guildId, new Set()).get(guildId)!;
                slashCommands.forEach(c => commands.add(c));
            }

            for (const guildId of config.registerToGuilds ?? []) {
                const commands = guildCommands.get(guildId) ?? guildCommands.set(guildId, new Set()).get(guildId)!;
                for (const command of [...contextMenuCommands, ...slashCommands]) {
                    commands.add(command);
                }
            }
        }

        if (config.allowRegisterGlobally !== false && (config.registerEmptyCommands || globalCommands.length)) {
            const commands = await this.client.application!.commands.set(globalCommands)
                .then(cmds => {
                    this.client.emit('recipleRegisterApplicationCommands', cmds);
                    return cmds;
                })
                .catch(err => this.client._throwError(err));

            if (commands) commands.forEach(c => store.global.set(c.id, c));
        }

        if (config.allowRegisterToGuilds) {
            for (const [guildId, APIcommands] of guildCommands) {
                if (!config.registerEmptyCommands && !APIcommands.size) continue;

                const commands = await this.client.application!.commands.set([...APIcommands.values()], guildId)
                    .then(cmds => {
                        this.client.emit('recipleRegisterApplicationCommands', cmds, guildId);
                        return cmds;
                    })
                    .catch(err => this.client._throwError(err));

                store.guilds.set(guildId, commands ?? new Collection());
            }
        }

        return store;
    }

    /**
     * Executes a command.
     * @param interaction The object that triggered the command.
     */
    public async execute(interaction: ContextMenuCommandInteraction): Promise<ContextMenuCommandExecuteData|null>;
    public async execute(message: Message): Promise<MessageCommandExecuteData|null>;
    public async execute(interaction: ChatInputCommandInteraction): Promise<SlashCommandExecuteData|null>;
    public async execute(command: ContextMenuCommandInteraction|Message|ChatInputCommandInteraction): Promise<AnyCommandExecuteData|null> {
        if (command instanceof Message) {
            return MessageCommandBuilder.execute({ client: this.client, message: command });
        } else if (command.isContextMenuCommand()) {
            return ContextMenuCommandBuilder.execute({ client: this.client, interaction: command });
        } else if (command.isChatInputCommand()) {
            return SlashCommandBuilder.execute({ client: this.client, interaction: command });
        }

        return null;
    }

    /**
     * Execute a command with execute data
     * @param data The command execute data.
     */
    public async executeCommandBuilderExecute(data: AnyCommandExecuteData): Promise<boolean> {
        try {
            switch (data.type) {
                case CommandType.ContextMenuCommand:
                    await data.builder.execute(data);
                    break;
                case CommandType.MessageCommand:
                    await data.builder.execute(data);
                    break;
                case CommandType.SlashCommand:
                    await data.builder.execute(data);
                    break;
            }

            return this.client.emit('recipleCommandExecute', data);
        } catch (error) {
            // @ts-expect-error Types is broken here
            const haltData = await this.executeHalts({
                commandType: data.type,
                reason: CommandHaltReason.Error,
                executeData: data,
                error
            })
            .catch(err => {
                this.client._throwError(new RecipleError(RecipleError.createCommandHaltErrorOptions(data.builder, err)));
                return null;
            });

            if (haltData === false) this.client._throwError(new RecipleError(RecipleError.createCommandExecuteErrorOptions(data.builder, error)))
        }

        return false;
    }

    public toJSON() {
        return {
            contextMenuCommands: this.contextMenuCommands.map(c => c.toJSON()),
            messageCommands: this.messageCommands.map(c => c.toJSON()),
            slashCommands: this.slashCommands.map(c => c.toJSON()),
            preconditions: this.preconditions.map(p => p.toJSON())
        }
    }
}
