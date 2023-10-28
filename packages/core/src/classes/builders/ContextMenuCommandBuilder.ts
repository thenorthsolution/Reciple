import { ApplicationCommandType, Awaitable, ContextMenuCommandInteraction, ContextMenuCommandType, ContextMenuCommandBuilder as DiscordJsContextMenuCommandBuilder, JSONEncodable, PermissionsBitField, PermissionResolvable, RESTPostAPIContextMenuApplicationCommandsJSONBody, SlashCommandAssertions, isJSONEncodable } from 'discord.js';
import { BaseCommandBuilder, BaseCommandBuilderData } from './BaseCommandBuilder';
import { CommandHaltReason, CommandType } from '../../types/constants';
import { RecipleClient } from '../structures/RecipleClient';
import { CommandHaltData } from '../../types/structures';
import { CooldownData } from '../structures/Cooldown';
import { Mixin } from 'ts-mixer';

export interface ContextMenuCommandExecuteData {
    type: CommandType.ContextMenuCommand;
    client: RecipleClient<true>;
    interaction: ContextMenuCommandInteraction;
    builder: ContextMenuCommandBuilder;
}

export type ContextMenuCommandHaltData = CommandHaltData<CommandType.ContextMenuCommand>;

export type ContextMenuCommandExecuteFunction = (executeData: ContextMenuCommandExecuteData) => Awaitable<void>;
export type ContextMenuCommandHaltFunction = (haltData: ContextMenuCommandHaltData) => Awaitable<boolean>;

export interface ContextMenuCommandBuilderData extends BaseCommandBuilderData, Omit<RESTPostAPIContextMenuApplicationCommandsJSONBody, 'options'|'description'|'description_localizations'|'type'> {
    command_type: CommandType.ContextMenuCommand;
    type: ContextMenuCommandType|'Message'|'User';
    halt?: ContextMenuCommandHaltFunction;
    execute: ContextMenuCommandExecuteFunction;
}

export interface ContextMenuCommandBuilder extends DiscordJsContextMenuCommandBuilder, BaseCommandBuilder {
    halt?: ContextMenuCommandHaltFunction;
    execute: ContextMenuCommandExecuteFunction;

    setHalt(halt: ContextMenuCommandHaltFunction|null): this;
    setExecute(execute: ContextMenuCommandExecuteFunction): this;
}

export class ContextMenuCommandBuilder extends Mixin(DiscordJsContextMenuCommandBuilder, BaseCommandBuilder) {
    public readonly command_type: CommandType.ContextMenuCommand = CommandType.ContextMenuCommand;

    constructor(data?: Omit<Partial<ContextMenuCommandBuilderData>, 'command_type'>) {
        super(data);

        if (data?.default_member_permissions) this.setDefaultMemberPermissions(data.default_member_permissions);
        if (data?.dm_permission) this.setDMPermission(data.dm_permission);
        if (data?.default_permission !== undefined) this.setDefaultPermission(data.default_permission);
        if (data?.execute) this.setExecute(data.execute);
        if (data?.halt) this.setHalt(data.halt);
        if (data?.name) this.setName(data.name);
        if (data?.name_localizations) this.setNameLocalizations(data.name_localizations);
        if (data?.nsfw) this.setNSFW(data.nsfw);
        if (data?.type) this.setType(data.type);
    }

    public setNSFW(nsfw: boolean) {
        SlashCommandAssertions.validateNSFW(nsfw);
        Reflect.set(this, "nsfw", nsfw);
        return this;
    }

    public setType(type: ContextMenuCommandType|'Message'|'User'): this {
        return super.setType(typeof type === 'number'
            ? type
            : type === 'Message'
                ? ApplicationCommandType.Message
                : ApplicationCommandType.User);
    }

    public setDefaultMemberPermissions(permissions?: string|number|bigint|null): this {
        return super.setRequiredMemberPermissions(permissions ? BigInt(permissions) : null);
    }

    public setRequiredMemberPermissions(permissions: PermissionResolvable|null): this {
        const bigint = permissions ? PermissionsBitField.resolve(permissions) : null;

        this.required_member_permissions = bigint ?? undefined;
        Reflect.set(this, 'default_member_permissions', String(bigint));

        return this;
    }

    public toJSON(): RESTPostAPIContextMenuApplicationCommandsJSONBody & ContextMenuCommandBuilderData {
        return {
            ...super.toJSON(),
            ...super._toJSON()
        }
    }

    public static from(data: ContextMenuCommandResolvable): ContextMenuCommandBuilder {
        return new ContextMenuCommandBuilder(isJSONEncodable(data) ? data.toJSON() : data);
    }

    public static resolve(data: ContextMenuCommandResolvable): ContextMenuCommandBuilder {
        return data instanceof ContextMenuCommandBuilder ? data : this.from(data);
    }

    public static async execute({ client, interaction, command }: ContextMenuCommandExecuteOptions): Promise<ContextMenuCommandExecuteData|null> {
        if (client.config.commands?.contextMenuCommand?.acceptRepliedInteractions === false && (interaction.replied || interaction.deferred)) return null;

        const builder = command ? this.resolve(command) : client.commands.get(interaction.commandName, CommandType.ContextMenuCommand);
        if (!builder) return null;

        const executeData: ContextMenuCommandExecuteData = {
            type: builder.command_type,
            builder,
            interaction,
            client
        };

        if (client.config.commands?.contextMenuCommand?.enableCooldown !== false && builder.cooldown) {
            const cooldownData: Omit<CooldownData, 'endsAt'> = {
                commandType: builder.command_type,
                commandName: builder.name,
                userId: interaction.user.id,
                guildId: interaction.guild?.id
            };

            const cooldown = client.cooldowns.findCooldown(cooldownData);

            if (cooldown) {
                await client.executeCommandBuilderHalt({
                    reason: CommandHaltReason.Cooldown,
                    commandType: builder.command_type,
                    cooldown,
                    executeData
                });
                return null;
            }
        }

        const commandPreconditionTrigger = await client.commands.executePreconditions(executeData);
        if (commandPreconditionTrigger) {
            await client.executeCommandBuilderHalt({
                reason: CommandHaltReason.PreconditionTrigger,
                commandType: builder.command_type,
                ...commandPreconditionTrigger
            });
            return null;
        }

        return (await client.executeCommandBuilderExecute(executeData)) ? executeData : null;
    }
}


export interface ContextMenuCommandExecuteOptions {
    client: RecipleClient<true>;
    interaction: ContextMenuCommandInteraction;
    command?: ContextMenuCommandResolvable;
}

export type ContextMenuCommandResolvable = ContextMenuCommandBuilderData|JSONEncodable<ContextMenuCommandBuilderData>;
