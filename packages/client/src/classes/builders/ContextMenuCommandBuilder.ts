import discordjs, { ApplicationCommandType, Awaitable, ContextMenuCommandInteraction, ContextMenuCommandType } from 'discord.js';
import { BaseInteractionBasedCommandData, CommandType } from '../../types/commands';
import { BaseCommandBuilder, BaseCommandBuilderData } from './BaseCommandBuilder';
import { CommandCooldownData } from '../managers/CommandCooldownManager';
import { CommandHaltData, CommandHaltReason } from '../../types/halt';
import { botHasPermissionsToExecute } from '../../utils/permissions';
import { RecipleClient } from '../RecipleClient';
import { Mixin } from 'ts-mixer';

export interface ContextMenuCommandExecuteData {
    /**
     * The type of command.
     */
    commandType: CommandType.ContextMenuCommand;
    /**
     * The current bot client. This is the client that the command is being executed on.
     */
    client: RecipleClient;
    /**
     * The command interaction. This is the interaction that triggered the command.
     */
    interaction: ContextMenuCommandInteraction;
    /**
     * The command builder. This is the builder that was used to create the command.
     */
    builder: ContextMenuCommandBuilder;
}

export type ContextMenuCommandHaltData = CommandHaltData<CommandType.ContextMenuCommand>;

export type ContextMenuCommandExecuteFunction = (executeData: ContextMenuCommandExecuteData) => Awaitable<void>;
export type ContextMenuCommandPreconditionFunction = (executeData: ContextMenuCommandExecuteData) => Awaitable<boolean>;
export type ContextMenuCommandHaltFunction = (haltData: ContextMenuCommandHaltData) => Awaitable<boolean>;

export type ContextMenuCommandResolvable = ContextMenuCommandBuilder|ContextMenuCommandData;

export interface ContextMenuCommandData extends BaseCommandBuilderData, BaseInteractionBasedCommandData<false> {
    commandType: CommandType.ContextMenuCommand;
    type: ContextMenuCommandType|'User'|'Message';
    halt?: ContextMenuCommandHaltFunction;
    execute?: ContextMenuCommandExecuteFunction;
}

export interface ContextMenuCommandBuilder extends discordjs.ContextMenuCommandBuilder, BaseCommandBuilder {
    halt?: ContextMenuCommandHaltFunction;
    execute?: ContextMenuCommandExecuteFunction;
    setHalt(halt?: ContextMenuCommandHaltFunction|null): this;
    setExecute(execute?: ContextMenuCommandExecuteFunction|null): this;
}

export class ContextMenuCommandBuilder extends Mixin(discordjs.ContextMenuCommandBuilder, BaseCommandBuilder) {
    readonly commandType: CommandType.ContextMenuCommand = CommandType.ContextMenuCommand;

    constructor(data?: Omit<Partial<ContextMenuCommandData>, 'commandType'>) {
        super(data);

        if (data?.name !== undefined) this.setName(data.name);
        if (data?.type !== undefined) this.setType(data.type);
        if (data?.nameLocalizations !== undefined) this.setNameLocalizations(data.nameLocalizations);
    }

    public setRequiredMemberPermissions(permissions?: discordjs.PermissionResolvable | null | undefined): this {
        super.setRequiredMemberPermissions(permissions);
        this.setDefaultMemberPermissions(this.requiredMemberPermissions);
        return this;
    }

    public override setType(type: ContextMenuCommandType|'User'|'Message'): this {
        super.setType(typeof type === 'number' ? type : ApplicationCommandType[type]);
        return this;
    }

    /**
     * Resolve a context menu command data and return a builder
     * @param contextMenuCommandResolvable Context menu command data
     */
    public static resolve(contextMenuCommandResolvable: ContextMenuCommandResolvable): ContextMenuCommandBuilder {
        return this.isContextMenuCommandBuilder(contextMenuCommandResolvable) ? contextMenuCommandResolvable : new ContextMenuCommandBuilder(contextMenuCommandResolvable);
    }

    public static isContextMenuCommandBuilder(data: any): data is ContextMenuCommandBuilder {
        return data instanceof ContextMenuCommandBuilder;
    }

    /**
     * Execute a context menu command
     * @param client Current bot client
     * @param interaction Context menu command interaction
     */
    public static async execute(client: RecipleClient, interaction: ContextMenuCommandInteraction, command?: ContextMenuCommandResolvable): Promise<ContextMenuCommandExecuteData|undefined> {
        if (client.config.commands?.contextMenuCommand?.enabled === false) return;
        if (client.config.commands?.contextMenuCommand?.acceptRepliedInteractions === false && (interaction.replied || interaction.deferred)) return;

        const builder = command ? this.resolve(command) : client.commands.get(interaction.commandName, CommandType.ContextMenuCommand);
        if (!builder) return;

        const executeData: ContextMenuCommandExecuteData = {
            builder,
            commandType: builder.commandType,
            interaction,
            client
        };

        if (client.config.commands?.contextMenuCommand?.enableCooldown !== false && builder.cooldown) {
            const cooldownData: Omit<CommandCooldownData, 'endsAt'> = {
                command: builder.name,
                user: interaction.user,
                type: builder.commandType
            };

            if (!client.cooldowns.isCooledDown(cooldownData)) {
                client.cooldowns.add({ ...cooldownData, endsAt: new Date(Date.now() + builder.cooldown) });
            } else {
                await client._haltCommand(builder, {
                    commandType: builder.commandType,
                    reason: CommandHaltReason.Cooldown,
                    cooldownData: client.cooldowns.get(cooldownData)!,
                    executeData
                });
                return;
            }
        }

        if (builder.requiredBotPermissions && interaction.inGuild()) {
            const isBotExecuteAllowed = botHasPermissionsToExecute((interaction.channel || interaction.guild)!, builder.requiredBotPermissions);
            if (!isBotExecuteAllowed) {
                await client._haltCommand(builder, {
                    commandType: builder.commandType,
                    reason: CommandHaltReason.MissingBotPermissions,
                    executeData
                });
                return;
            }
        }

        const precondition = await client._executeCommandPrecondition(builder, executeData);
        if (!precondition) return;

        return (await client._executeCommand(builder, executeData)) ? executeData : undefined;
    }
}
