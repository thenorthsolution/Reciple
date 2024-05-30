import { ApplicationCommand, ApplicationCommandDataResolvable, ChatInputCommandInteraction, Collection, ContextMenuCommandInteraction, FetchApplicationCommandOptions, JSONEncodable, Message, RESTPostAPIChatInputApplicationCommandsJSONBody, RESTPostAPIContextMenuApplicationCommandsJSONBody, RestOrArray, isJSONEncodable, normalizeArray } from 'discord.js';
import { AnyCommandBuilder, AnyCommandExecuteData, AnyCommandHaltTriggerData, AnyCommandResolvable, RecipleClientConfig, RecipleClientInteractionBasedCommandConfigOptions } from '../../types/structures.js';
import { CommandPrecondition, CommandPreconditionResolvable, CommandPreconditionResultData } from '../structures/CommandPrecondition.js';
import { AnySlashCommandBuilder, SlashCommandBuilder, SlashCommandExecuteData } from '../builders/SlashCommandBuilder.js';
import { ContextMenuCommandBuilder, ContextMenuCommandExecuteData } from '../builders/ContextMenuCommandBuilder.js';
import { MessageCommandBuilder, MessageCommandExecuteData } from '../builders/MessageCommandBuilder.js';
import { RecipleClient } from '../structures/RecipleClient.js';
import { CommandType } from '../../types/constants.js';
import { Utils } from '../structures/Utils.js';
import defaultsDeep from 'lodash.defaultsdeep';
import { CommandHalt, CommandHaltResultData } from '../structures/CommandHalt.js';

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

    public addPreconditions(...data: RestOrArray<CommandPreconditionResolvable>): CommandPrecondition[] {
        const preconditions = normalizeArray(data).map(p => CommandPrecondition.resolve(p));

        for (const precondition of preconditions) {
            this.preconditions.set(precondition.id, precondition);
        }

        return preconditions;
    }

    public removePreconditions(...data: RestOrArray<string>): CommandPrecondition[] {
        const ids = normalizeArray(data);
        const preconditions: CommandPrecondition[] = [];

        for (const id of ids) {
            const precondition = this.preconditions.get(id);
            if (!precondition) continue;

            preconditions.push(precondition);
            this.preconditions.delete(id);
        }

        return preconditions;
    }

    public disablePreconditions(...data: RestOrArray<string|CommandPreconditionResolvable>): CommandPrecondition[] {
        const ids = normalizeArray(data).map(id => typeof id === 'string' ? id : CommandPrecondition.resolve(id).id);
        const preconditions: CommandPrecondition[] = [];

        for (const id of ids) {
            const precondition = this.preconditions.get(id);
            if (!precondition) continue;

            precondition.setDisabled(false);
        }

        return preconditions;
    }

    public enablePreconditions(...data: RestOrArray<string|CommandPreconditionResolvable>): CommandPrecondition[] {
        const ids = normalizeArray(data).map(id => typeof id === 'string' ? id : CommandPrecondition.resolve(id).id);
        const preconditions: CommandPrecondition[] = [];

        for (const id of ids) {
            const precondition = this.preconditions.get(id);
            if (!precondition) continue;

            precondition.setDisabled(false);
        }

        return preconditions;
    }

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

    public async executeHalts<T extends AnyCommandHaltTriggerData = AnyCommandHaltTriggerData>(trigger: T): Promise<CommandHaltResultData<T['commandType']>|null> {
        const halts: CommandHalt<T['commandType']>[] = [];
        const disabledHalts = trigger.executeData.builder.disabled_halts;

        for (const halt of trigger.executeData.builder.halts) {
            const data = CommandHalt.resolve<T['commandType']>(halt);
            if (halts.some(p => p.id === data.id)  || disabledHalts.includes(data.id)) continue;

            halts.push(data);
        }

        halts.push(...this.halts.values());

        for (const halt of halts) {
            if (halt.disabled || disabledHalts.some(p => p === halt.id)) continue;

            const data = await halt.execute(trigger);
            if (!data.successful) return data;
        }

        return null;
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

    public getApplicationCommand(command: string, guildId?: string): ApplicationCommand|undefined {
        return this.client.application?.commands.cache.find(c => command && (guildId ? c.guildId === guildId : c.guildId === null));
    }

    public async fetchApplicationCommand(command: string, guildId?: string): Promise<ApplicationCommand|undefined>;
    public async fetchApplicationCommand(command: string, options?: FetchApplicationCommandOptions): Promise<ApplicationCommand|undefined>;
    public async fetchApplicationCommand(command: string, options?: string|FetchApplicationCommandOptions): Promise<ApplicationCommand|undefined> {
        const commands = await this.client.application?.commands.fetch(typeof options === 'string' ? { guildId: options } : options ?? {});
        return commands?.find(c => c.name === command);
    }

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

    public toJSON() {
        return {
            contextMenuCommands: this.contextMenuCommands.map(c => c.toJSON()),
            messageCommands: this.messageCommands.map(c => c.toJSON()),
            slashCommands: this.slashCommands.map(c => c.toJSON()),
            preconditions: this.preconditions.map(p => p.toJSON())
        }
    }
}
