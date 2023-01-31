import discordjs, { Awaitable, ContextMenuCommandInteraction, ContextMenuCommandType } from 'discord.js';
import { BaseInteractionBasedCommandData, CommandType } from '../../types/commands';
import { BaseCommandBuilder, BaseCommandBuilderData } from './BaseCommandBuilder';
import { CommandHaltData, CommandHaltReason } from '../../types/halt';
import { RecipleClient } from '../RecipleClient';
import { Mixin, mix } from 'ts-mixer';
import { CommandCooldownData } from '../managers/CommandCooldownManager';
import { botHasPermissionsToExecute } from '../utils/permissions';

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
    type: ContextMenuCommandType;
    halt?: ContextMenuCommandHaltFunction;
    execute?: ContextMenuCommandExecuteFunction;
}

export interface ContextMenuCommandBuilder extends discordjs.ContextMenuCommandBuilder, BaseCommandBuilder {}

export class ContextMenuCommandBuilder extends Mixin(discordjs.ContextMenuCommandBuilder, BaseCommandBuilder) {
    readonly commandType: CommandType.ContextMenuCommand = CommandType.ContextMenuCommand;

    public halt?: ContextMenuCommandHaltFunction;
    public execute?: ContextMenuCommandExecuteFunction;

    constructor(data?: Omit<Partial<ContextMenuCommandData>, 'commandType'>) {
        super(data);

        if (data?.name !== undefined) this.setName(data.name);
        if (data?.nameLocalizations !== undefined) this.setNameLocalizations(data.nameLocalizations);
    }

    public setHalt(halt?: ContextMenuCommandHaltFunction|null): this {
        this.halt = halt || undefined;
        return this;
    }

    public setExecute(execute?: ContextMenuCommandExecuteFunction|null): this {
        this.execute = execute || undefined;
        return this;
    }

    public static resolve(contextMenuCommandResolvable: ContextMenuCommandResolvable): ContextMenuCommandBuilder {
        return contextMenuCommandResolvable instanceof ContextMenuCommandBuilder ? contextMenuCommandResolvable : new ContextMenuCommandBuilder(contextMenuCommandResolvable);
    }

    public static async execute(client: RecipleClient, interaction: ContextMenuCommandInteraction): Promise<ContextMenuCommandExecuteData|undefined> {
        if (!client.config.commands.contextMenuCommand.enabled) return;
        if (!client.config.commands.contextMenuCommand.acceptRepliedInteractions && (interaction.replied || interaction.deferred)) return;

        const builder = client.commands.get(interaction.commandName, CommandType.ContextMenuCommand);
        if (!builder) return;

        const executeData: ContextMenuCommandExecuteData = {
            builder,
            commandType: builder.commandType,
            interaction,
            client
        };

        if (client.config.commands.contextMenuCommand.enableCooldown && builder.cooldown) {
            const cooldownData: Omit<CommandCooldownData, 'endsAt'> = {
                command: builder.name,
                user: interaction.user,
                type: builder.commandType
            };

            const isCooledDown = client.cooldowns.isCooledDown(cooldownData);
            if (!isCooledDown) {
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
