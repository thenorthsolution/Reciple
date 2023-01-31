import discordjs, { Awaitable, ContextMenuCommandInteraction, ContextMenuCommandType } from 'discord.js';
import { BaseInteractionBasedCommandData, CommandType } from '../../types/commands';
import { BaseCommandBuilder, BaseCommandBuilderData } from './BaseCommandBuilder';
import { CommandHaltData, CommandHaltReason } from '../../types/halt';
import { RecipleClient } from '../RecipleClient';
import { mix } from 'ts-mixer';
import { CommandCooldownData } from '../managers/CommandCooldownManager';
import { botHasPermissionsToExecute } from '../utils/permissions';

export interface ContextMenuCommandExecuteData<Metadata = unknown> {
    commandType: CommandType.ContextMenuCommand;
    client: RecipleClient;
    interaction: ContextMenuCommandInteraction;
    builder: ContextMenuCommandBuilder<Metadata>;
}

export type ContextMenuCommandHaltData<Metadata = unknown> = CommandHaltData<CommandType.ContextMenuCommand, Metadata>;

export type ContextMenuCommandExecuteFunction<Metadata = unknown> = (executeData: ContextMenuCommandExecuteData<Metadata>) => Awaitable<void>;
export type ContextMenuCommandHaltFunction<Metadata = unknown> = (haltData: ContextMenuCommandHaltData<Metadata>) => Awaitable<boolean>;

export type ContextMenuCommandResolvable<Metadata = unknown> = ContextMenuCommandBuilder<Metadata>|ContextMenuCommandData<Metadata>;

export interface ContextMenuCommandData<Metadata = unknown> extends BaseCommandBuilderData<Metadata>, BaseInteractionBasedCommandData<false> {
    commandType: CommandType.ContextMenuCommand;
    type: ContextMenuCommandType;
    halt?: ContextMenuCommandHaltFunction<Metadata>;
    execute?: ContextMenuCommandExecuteFunction<Metadata>;
}

export interface ContextMenuCommandBuilder<Metadata = unknown> extends discordjs.ContextMenuCommandBuilder, BaseCommandBuilder<Metadata> {}

@mix(discordjs.ContextMenuCommandBuilder, BaseCommandBuilder)
export class ContextMenuCommandBuilder<Metadata = unknown> {
    readonly commandType: CommandType.ContextMenuCommand = CommandType.ContextMenuCommand;

    public halt?: ContextMenuCommandHaltFunction<Metadata>;
    public execute?: ContextMenuCommandExecuteFunction<Metadata>;

    constructor(data?: Omit<Partial<ContextMenuCommandData<Metadata>>, 'commandType'>) {
        this.from(data);

        if (data?.name !== undefined) this.setName(data.name);
        if (data?.nameLocalizations !== undefined) this.setNameLocalizations(data.nameLocalizations);
    }

    public setHalt(halt?: ContextMenuCommandHaltFunction<Metadata>|null): this {
        this.halt = halt || undefined;
        return this;
    }

    public setExecute(execute?: ContextMenuCommandExecuteFunction<Metadata>|null): this {
        this.execute = execute || undefined;
        return this;
    }

    public static resolve<Metadata = unknown>(contextMenuCommandResolvable: ContextMenuCommandResolvable<Metadata>): ContextMenuCommandBuilder<Metadata> {
        return contextMenuCommandResolvable instanceof ContextMenuCommandBuilder ? contextMenuCommandResolvable : new ContextMenuCommandBuilder(contextMenuCommandResolvable);
    }

    public static async execute<Metadata = unknown>(client: RecipleClient, interaction: ContextMenuCommandInteraction): Promise<ContextMenuCommandExecuteData<Metadata>|undefined> {
        if (!client.config.commands.contextMenuCommand.enabled) return;
        if (!client.config.commands.contextMenuCommand.acceptRepliedInteractions && (interaction.replied || interaction.deferred)) return;

        const builder = client.commands.get<Metadata>(interaction.commandName, CommandType.ContextMenuCommand);
        if (!builder) return;

        const executeData: ContextMenuCommandExecuteData<Metadata> = {
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
                await client._haltCommand<Metadata>(builder, {
                    commandType: builder.commandType,
                    reason: CommandHaltReason.Cooldown,
                    cooldownData: client.cooldowns.get(cooldownData)!,
                    executeData
                });
                return;
            }
        }

        if (builder.requiredBotPermissions !== undefined && interaction.inGuild()) {
            const isBotExecuteAllowed = botHasPermissionsToExecute((interaction.channel || interaction.guild)!, builder.requiredBotPermissions);
            if (!isBotExecuteAllowed) {
                await client._haltCommand<Metadata>(builder, {
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
