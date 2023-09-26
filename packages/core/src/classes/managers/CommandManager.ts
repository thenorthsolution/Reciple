import { ApplicationCommand, ApplicationCommandDataResolvable, Collection, JSONEncodable, RESTPostAPIChatInputApplicationCommandsJSONBody, RESTPostAPIContextMenuApplicationCommandsJSONBody, RestOrArray, isJSONEncodable, mergeDefault, normalizeArray } from 'discord.js';
import { MessageCommandBuilder } from '../builders/MessageCommandBuilder';
import { AnySlashCommandBuilder } from '../builders/SlashCommandBuilder';
import { RecipleClient } from '../structures/RecipleClient';
import { ContextMenuCommandBuilder } from '../builders/ContextMenuCommandBuilder';
import { CommandPrecondition, CommandPreconditionResolvable } from '../structures/CommandPrecondition';
import { CommandType } from '../../types/constants';
import { AnyCommandBuilder, RecipleClientConfig, RecipleClientInteractionBasedCommandConfigOptions } from '../../types/structures';

export interface CommandManagerRegisterCommandsOptions extends Omit<RecipleClientConfig['applicationCommandRegister'], 'enabled'> {
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

    public disablePreconditions(...data: RestOrArray<string>): CommandPrecondition[] {
        const ids = normalizeArray(data);
        const preconditions: CommandPrecondition[] = [];

        for (const id of ids) {
            const precondition = this.preconditions.get(id);
            if (!precondition) continue;

            precondition.setDisabled(false);
        }

        return preconditions;
    }

    public enablePreconditions(...data: RestOrArray<string>): CommandPrecondition[] {
        const ids = normalizeArray(data);
        const preconditions: CommandPrecondition[] = [];

        for (const id of ids) {
            const precondition = this.preconditions.get(id);
            if (!precondition) continue;

            precondition.setDisabled(false);
        }

        return preconditions;
    }

    public get(command: string, type: CommandType.ContextMenuCommand): ContextMenuCommandBuilder | undefined;
    public get(command: string, type: CommandType.MessageCommand): MessageCommandBuilder | undefined;
    public get(command: string, type: CommandType.SlashCommand): AnySlashCommandBuilder | undefined;
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

    public async registerApplicationCommands(options?: CommandManagerRegisterCommandsOptions): Promise<{ global: Collection<string, ApplicationCommand>; guilds: Collection<string, Collection<string, ApplicationCommand>> }> {
        const store = { global: new Collection<string, ApplicationCommand>(), guilds: new Collection<string, Collection<string, ApplicationCommand>>() };
        const config = mergeDefault({ ...this.client.config.commands, ...this.client.config.applicationCommandRegister }, options) as CommandManagerRegisterCommandsOptions;

        const contextMenuCommands = (options?.contextMenuCommands?.commands ?? [...this.contextMenuCommands.values()]).map(c => isJSONEncodable(c) ? c.toJSON() : c);
        const slashCommands = (options?.slashCommands?.commands ?? [...this.slashCommands.values()]).map(c => isJSONEncodable(c) ? c.toJSON() : c);

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

    public async fetchApplicationCommand(command: string, guildId?: string): Promise<ApplicationCommand|undefined> {
        const commands = await this.client.application?.commands.fetch({ guildId });
        return commands?.find(c => c.name === command);
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
