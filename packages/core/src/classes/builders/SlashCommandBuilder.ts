import { ApplicationCommandType, Awaitable, ChatInputCommandInteraction, isJSONEncodable, JSONEncodable, SlashCommandBuilder as DiscordJsSlashCommandBuilder, SharedSlashCommandOptions, RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandSubcommandGroupBuilder, SlashCommandSubcommandBuilder, SlashCommandAttachmentOption, SlashCommandBooleanOption, SlashCommandChannelOption, SlashCommandIntegerOption, SlashCommandMentionableOption, SlashCommandNumberOption, SlashCommandRoleOption, SlashCommandStringOption, SlashCommandUserOption, ApplicationCommandOptionType, ApplicationCommandOptionAllowedChannelTypes, PermissionResolvable, PermissionsBitField } from 'discord.js';
import { Mixin } from 'ts-mixer';
import { BaseCommandBuilder, BaseCommandBuilderData } from './BaseCommandBuilder';
import { CommandHaltReason, CommandType } from '../../types/constants';
import { RecipleClient } from '../structures/RecipleClient';
import { AnyNonSubcommandSlashCommandOptionBuilder, AnySlashCommandOptionBuilder, AnySlashCommandOptionData, CommandHaltData } from '../../types/structures';
import { CooldownData } from '../structures/Cooldown';

export interface SlashCommandExecuteData {
    type: CommandType.SlashCommand;
    client: RecipleClient<true>;
    interaction: ChatInputCommandInteraction;
    builder: AnySlashCommandBuilder;
}

export type SlashCommandHaltData = CommandHaltData<CommandType.SlashCommand>;

export type SlashCommandExecuteFunction = (executeData: SlashCommandExecuteData) => Awaitable<void>;
export type SlashCommandHaltFunction = (haltData: SlashCommandHaltData) => Awaitable<boolean>;

export interface SlashCommandBuilderData extends BaseCommandBuilderData, Omit<RESTPostAPIChatInputApplicationCommandsJSONBody, 'type'> {
    command_type: CommandType.SlashCommand;
    halt?: SlashCommandHaltFunction;
    execute: SlashCommandExecuteFunction;
}

export type SlashCommandBuilderNonSubcommandAddOptionMethods = 'addBooleanOption'|'addUserOption'|'addChannelOption'|'addRoleOption'|'addAttachmentOption'|'addMentionableOption'|'addStringOption'|'addIntegerOption'|'addNumberOption';
export type SlashCommandBuilderSubcommandAddOptionMethods = 'addSubcommand'|'addSubcommandGroup';

export interface SlashCommandBuilder extends DiscordJsSlashCommandBuilder, BaseCommandBuilder {
    halt?: SlashCommandHaltFunction;
    execute: SlashCommandExecuteFunction;

    setHalt(halt: SlashCommandHaltFunction): this;
    setExecute(execute: SlashCommandExecuteFunction): this;

    addSubcommandGroup(input: SlashCommandSubcommandGroupBuilder|((subcommandGroup: SlashCommandSubcommandGroupBuilder) => SlashCommandSubcommandGroupBuilder)): Omit<this, SlashCommandBuilderNonSubcommandAddOptionMethods>;
    addSubcommand(input: SlashCommandSubcommandBuilder|((subcommandGroup: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder)): Omit<this, SlashCommandBuilderNonSubcommandAddOptionMethods>;

    addBooleanOption(input: SlashCommandBooleanOption|((builder: SlashCommandBooleanOption) => SlashCommandBooleanOption)): Omit<this, SlashCommandBuilderSubcommandAddOptionMethods>;
    addUserOption(input: SlashCommandUserOption|((builder: SlashCommandUserOption) => SlashCommandUserOption)): Omit<this, SlashCommandBuilderSubcommandAddOptionMethods>;
    addChannelOption(input: SlashCommandChannelOption|((builder: SlashCommandChannelOption) => SlashCommandChannelOption)): Omit<this, SlashCommandBuilderSubcommandAddOptionMethods>;
    addRoleOption(input: SlashCommandRoleOption|((builder: SlashCommandRoleOption) => SlashCommandRoleOption)): Omit<this, SlashCommandBuilderSubcommandAddOptionMethods>;
    addAttachmentOption(input: SlashCommandAttachmentOption|((builder: SlashCommandAttachmentOption) => SlashCommandAttachmentOption)): Omit<this, SlashCommandBuilderSubcommandAddOptionMethods>;
    addMentionableOption(input: SlashCommandMentionableOption|((builder: SlashCommandMentionableOption) => SlashCommandMentionableOption)): Omit<this, SlashCommandBuilderSubcommandAddOptionMethods>;
    addStringOption(input:
        | SlashCommandStringOption
        | Omit<SlashCommandStringOption, 'setAutocomplete'>
        | Omit<SlashCommandStringOption, 'addChoices'>
        | ((builder: SlashCommandStringOption) => SlashCommandStringOption | Omit<SlashCommandStringOption, 'setAutocomplete'> | Omit<SlashCommandStringOption, 'addChoices'>)
    ): Omit<this, SlashCommandBuilderSubcommandAddOptionMethods>;
    addIntegerOption(input:
        | SlashCommandIntegerOption
        | Omit<SlashCommandIntegerOption, 'setAutocomplete'>
        | Omit<SlashCommandIntegerOption, 'addChoices'>
        | ((builder: SlashCommandIntegerOption) => SlashCommandIntegerOption | Omit<SlashCommandIntegerOption, 'setAutocomplete'> | Omit<SlashCommandIntegerOption, 'addChoices'>)
    ): Omit<this, SlashCommandBuilderSubcommandAddOptionMethods>;
    addNumberOption(input:
        | SlashCommandNumberOption
        | Omit<SlashCommandNumberOption, 'setAutocomplete'>
        | Omit<SlashCommandNumberOption, 'addChoices'>
        | ((builder: SlashCommandNumberOption) => SlashCommandNumberOption | Omit<SlashCommandNumberOption, 'setAutocomplete'> | Omit<SlashCommandNumberOption, 'addChoices'>)
    ): Omit<this, SlashCommandBuilderSubcommandAddOptionMethods>;
}

export class SlashCommandBuilder extends Mixin(DiscordJsSlashCommandBuilder, BaseCommandBuilder) {
    public readonly command_type: CommandType.SlashCommand = CommandType.SlashCommand;
    public readonly type?: ApplicationCommandType.ChatInput = ApplicationCommandType.ChatInput;

    constructor(data?: Omit<Partial<SlashCommandBuilderData>, 'command_type'>) {
        super(data);

        if (data?.nsfw) this.setNSFW(data.nsfw);
        if (data?.name !== undefined) this.setName(data.name);
        if (data?.name_localizations !== undefined) this.setNameLocalizations(data.name_localizations);
        if (data?.description !== undefined) this.setDescription(data.description);
        if (data?.description_localizations !== undefined) this.setDescriptionLocalizations(data.description_localizations);
        if (data?.default_member_permissions) this.setDefaultMemberPermissions(data.default_member_permissions);
        if (data?.dm_permission !== undefined) this.setDMPermission(data.dm_permission);
        if (data?.default_permission !== undefined) this.setDefaultPermission(data.default_permission);
        if (data?.options) {
            for (const option of data.options) {
                SlashCommandBuilder.addOption(this, SlashCommandBuilder.resolveOption<AnySlashCommandOptionBuilder>(option));
            }
        }
    }

    public setDefaultMemberPermissions(permissions?: string|number|bigint|null): this {
        return super.setRequiredMemberPermissions(permissions ? BigInt(permissions) : null);
    }

    public setRequiredMemberPermissions(permissions: PermissionResolvable|null): this {
        const bigint = permissions ? PermissionsBitField.resolve(permissions) : null;
        return super.setDefaultMemberPermissions(bigint).setRequiredMemberPermissions(bigint);
    }

    public toJSON(): SlashCommandBuilderData & { type?: ApplicationCommandType.ChatInput; } {
        return {
            ...super.toJSON(),
            ...super._toJSON()
        }
    }

    public static addOption<Builder extends SharedSlashCommandOptions>(builder: Builder, option: AnySlashCommandOptionBuilder): Builder {
        if (option instanceof SlashCommandAttachmentOption) {
            builder.addAttachmentOption(option);
        } else if (option instanceof SlashCommandBooleanOption) {
            builder.addBooleanOption(option);
        } else if (option instanceof SlashCommandChannelOption) {
            builder.addChannelOption(option);
        } else if (option instanceof SlashCommandIntegerOption) {
            builder.addIntegerOption(option);
        } else if (option instanceof SlashCommandMentionableOption) {
            builder.addMentionableOption(option);
        } else if (option instanceof SlashCommandNumberOption) {
            builder.addNumberOption(option);
        } else if (option instanceof SlashCommandRoleOption) {
            builder.addRoleOption(option);
        } else if (option instanceof SlashCommandStringOption) {
            builder.addStringOption(option);
        } else if (option instanceof SlashCommandUserOption) {
            builder.addUserOption(option);
        } else if (builder instanceof SlashCommandBuilder) {
            if (option instanceof SlashCommandSubcommandBuilder) {
                builder.addSubcommand(option);
            } else if (option instanceof SlashCommandSubcommandGroupBuilder) {
                builder.addSubcommandGroup(option);
            }
        }

        return builder;
    }

    public static resolveOption<T extends AnySlashCommandOptionBuilder = AnySlashCommandOptionBuilder>(data: AnySlashCommandOptionData): T {
        let builder: AnySlashCommandOptionBuilder = new SlashCommandAttachmentOption();

        switch (data.type) {
            case ApplicationCommandOptionType.String:
                builder = new SlashCommandStringOption();

                if (data.choices) builder.setChoices(...data.choices);
                if (data.autocomplete) builder.setAutocomplete(data.autocomplete);
                if (data.max_length) builder.setMaxLength(data.max_length);
                if (data.min_length) builder.setMinLength(data.min_length);
                break;
            case ApplicationCommandOptionType.Integer:
                builder = new SlashCommandIntegerOption();
                break;
            case ApplicationCommandOptionType.Boolean:
                builder = new SlashCommandBooleanOption();
                break;
            case ApplicationCommandOptionType.User:
                builder = new SlashCommandUserOption();
                break;
            case ApplicationCommandOptionType.Channel:
                builder = new SlashCommandChannelOption().addChannelTypes(...(data.channel_types as ApplicationCommandOptionAllowedChannelTypes[] ?? []));
                break;
            case ApplicationCommandOptionType.Role:
                builder = new SlashCommandRoleOption();
                break;
            case ApplicationCommandOptionType.Mentionable:
                builder = new SlashCommandMentionableOption();
                break;
            case ApplicationCommandOptionType.Number:
                builder = new SlashCommandNumberOption();
                break;
            case ApplicationCommandOptionType.Attachment:
                builder = new SlashCommandAttachmentOption();
                break;
            case ApplicationCommandOptionType.Subcommand:
                builder = new SlashCommandSubcommandBuilder();

                for (const optionData of data.options ?? []) {
                    this.addOption(builder, this.resolveOption<AnyNonSubcommandSlashCommandOptionBuilder>(optionData));
                }
                break;
            case ApplicationCommandOptionType.SubcommandGroup:
                builder = new SlashCommandSubcommandGroupBuilder();

                for (const subcommandData of data.options ?? []) {
                    builder.addSubcommand(this.resolveOption<SlashCommandSubcommandBuilder>(subcommandData));
                }
                break;
        }

        if (!(builder instanceof SlashCommandSubcommandBuilder) && !(builder instanceof SlashCommandSubcommandGroupBuilder)) {
            if (data.required) builder.setRequired(true);
        }

        if ((data.type === ApplicationCommandOptionType.Number || data.type === ApplicationCommandOptionType.Integer) && (builder instanceof SlashCommandNumberOption || builder instanceof SlashCommandIntegerOption)) {
            if (data.choices) builder.setChoices(...data.choices);
            if (data.min_value) builder.setMinValue(data.min_value);
            if (data.max_value) builder.setMaxValue(data.max_value);
            if (data.autocomplete) builder.setAutocomplete(data.autocomplete);
        }

        return builder
            .setName(data.name)
            .setNameLocalizations(data.name_localizations ?? {})
            .setDescription(data.description)
            .setDescriptionLocalizations(data.description_localizations ?? {}) as T;
    }

    public static from(data: SlashCommandResolvable): AnySlashCommandBuilder {
        return new SlashCommandBuilder(isJSONEncodable(data) ? data.toJSON() : data);
    }

    public static resolve(data: SlashCommandResolvable): AnySlashCommandBuilder {
        return data instanceof SlashCommandBuilder ? data : this.from(data);
    }

    public static async execute({ client, interaction, command }: SlashCommandExecuteOptions): Promise<SlashCommandExecuteData|null> {
        if (client.config.commands?.contextMenuCommands?.acceptRepliedInteractions === false && (interaction.replied || interaction.deferred)) return null;

        const builder = command ? this.resolve(command) : client.commands.get(interaction.commandName, CommandType.SlashCommand);
        if (!builder) return null;

        const executeData: SlashCommandExecuteData = {
            type: builder.command_type,
            builder,
            interaction,
            client
        };

        if (client.config.commands.contextMenuCommands.enableCooldown !== false && builder.cooldown) {
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

export interface SlashCommandExecuteOptions {
    client: RecipleClient<true>;
    interaction: ChatInputCommandInteraction;
    command?: SlashCommandResolvable;
}

export type SlashCommandResolvable = SlashCommandBuilderData|JSONEncodable<SlashCommandBuilderData>;
export type AnySlashCommandBuilder = Omit<SlashCommandBuilder, SlashCommandBuilderNonSubcommandAddOptionMethods>|Omit<SlashCommandBuilder, SlashCommandBuilderSubcommandAddOptionMethods>|SlashCommandBuilder;
