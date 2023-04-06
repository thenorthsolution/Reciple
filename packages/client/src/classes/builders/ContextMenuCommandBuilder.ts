import discordjs, { ApplicationCommandType, Awaitable, ContextMenuCommandInteraction, ContextMenuCommandType } from 'discord.js';
import { BaseInteractionBasedCommandData, CommandType } from '../../types/commands';
import { BaseCommandBuilder, BaseCommandBuilderData } from './BaseCommandBuilder';
import { CommandCooldownData } from '../managers/CommandCooldownManager';
import { CommandHaltData, CommandHaltReason } from '../../types/halt';
import { botHasPermissionsToExecute } from '../../utils/permissions';
import { RecipleClient } from '../RecipleClient';
import { Mixin } from 'ts-mixer';

export interface ContextMenuCommandExecuteData {
    commandType: CommandType.ContextMenuCommand;
    client: RecipleClient;
    interaction: ContextMenuCommandInteraction;
    builder: ContextMenuCommandBuilder;
}

export type ContextMenuCommandHaltData = CommandHaltData<CommandType.ContextMenuCommand>;

export type ContextMenuCommandExecuteFunction = (executeData: ContextMenuCommandExecuteData) => Awaitable<void>;
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

    public static resolve(contextMenuCommandResolvable: ContextMenuCommandResolvable): ContextMenuCommandBuilder {
        return contextMenuCommandResolvable instanceof ContextMenuCommandBuilder ? contextMenuCommandResolvable : new ContextMenuCommandBuilder(contextMenuCommandResolvable);
    }

    public override setType(type: ContextMenuCommandType|'User'|'Message'): this {
        super.setType(typeof type === 'number' ? type : ApplicationCommandType[type]);
        return this;
    }

    public static async execute(client: RecipleClient, interaction: ContextMenuCommandInteraction): Promise<ContextMenuCommandExecuteData|undefined> {
        if (!client.config.commands?.contextMenuCommand?.enabled !== false) return;
        if (!client.config.commands?.contextMenuCommand?.acceptRepliedInteractions && (interaction.replied || interaction.deferred)) return;

        const builder = client.commands.get(interaction.commandName, CommandType.ContextMenuCommand);
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

        return await client._executeCommand(builder, executeData) ? executeData : undefined;
    }
}
