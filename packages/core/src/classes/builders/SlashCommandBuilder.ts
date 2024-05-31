import { Awaitable, ChatInputCommandInteraction, JSONEncodable, SlashCommandBuilder as DiscordJsSlashCommandBuilder, RESTPostAPIChatInputApplicationCommandsJSONBody, ApplicationCommandType, SharedSlashCommandOptions, ApplicationCommandOptionType, SlashCommandStringOption, SlashCommandIntegerOption, SlashCommandBooleanOption, SlashCommandUserOption, SlashCommandChannelOption, ApplicationCommandOptionAllowedChannelTypes, SlashCommandRoleOption, SlashCommandMentionableOption, SlashCommandNumberOption, SlashCommandAttachmentOption, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder, isJSONEncodable, PermissionsBitField, PermissionResolvable, RestOrArray } from 'discord.js';
import { AnyNonSubcommandSlashCommandOptionBuilder, AnySlashCommandOptionBuilder, AnySlashCommandOptionData, CommandHaltTriggerData } from '../../types/structures.js';
import { BaseCommandBuilder, BaseCommandBuilderData } from './BaseCommandBuilder.js';
import { CommandHaltReason, CommandType } from '../../types/constants.js';
import { RecipleClient } from '../structures/RecipleClient.js';
import { CooldownData } from '../structures/Cooldown.js';
import { Mixin } from 'ts-mixer';
import { CommandHalt, CommandHaltResolvable, CommandHaltResultResolvable } from '../structures/CommandHalt.js';

export interface SlashCommandExecuteData {
    type: CommandType.SlashCommand;
    client: RecipleClient<true>;
    interaction: ChatInputCommandInteraction;
    builder: AnySlashCommandBuilder;
}

export type SlashCommandHaltTriggerData = CommandHaltTriggerData<CommandType.SlashCommand>;

export type SlashCommandExecuteFunction = (executeData: SlashCommandExecuteData) => Awaitable<void>;
export type SlashCommandHaltFunction = (haltData: SlashCommandHaltTriggerData) => Awaitable<CommandHaltResultResolvable<CommandType.SlashCommand>>;

export interface SlashCommandBuilderData extends BaseCommandBuilderData, Omit<RESTPostAPIChatInputApplicationCommandsJSONBody, 'type'> {
    command_type: CommandType.SlashCommand;
    halts?: CommandHaltResolvable<CommandType.SlashCommand>[];
    execute: SlashCommandExecuteFunction;
}

export type SlashCommandBuilderNonSubcommandAddOptionMethods = 'addBooleanOption'|'addUserOption'|'addChannelOption'|'addRoleOption'|'addAttachmentOption'|'addMentionableOption'|'addStringOption'|'addIntegerOption'|'addNumberOption';
export type SlashCommandBuilderSubcommandAddOptionMethods = 'addSubcommand'|'addSubcommandGroup';

export class SlashCommandSharedPrivateOptions extends SharedSlashCommandOptions<any> {}

export interface SlashCommandBuilder extends DiscordJsSlashCommandBuilder, BaseCommandBuilder {
    halts: CommandHalt<CommandType.SlashCommand>[];
    execute: SlashCommandExecuteFunction;

    setHalts(...halt: RestOrArray<CommandHaltResolvable<CommandType.SlashCommand>>): this;
    setExecute(execute: SlashCommandExecuteFunction): this;

    addSubcommandGroup(input: SlashCommandSubcommandGroupBuilder|((subcommandGroup: SlashCommandSubcommandGroupBuilder) => SlashCommandSubcommandGroupBuilder)): Omit<this, SlashCommandBuilderNonSubcommandAddOptionMethods>;
    addSubcommand(input: SlashCommandSubcommandBuilder|((subcommandGroup: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder)): Omit<this, SlashCommandBuilderNonSubcommandAddOptionMethods>;

    addBooleanOption(input: SlashCommandBooleanOption|((builder: SlashCommandBooleanOption) => SlashCommandBooleanOption)): Omit<this, SlashCommandBuilderSubcommandAddOptionMethods> & SlashCommandSharedPrivateOptions;
    addUserOption(input: SlashCommandUserOption|((builder: SlashCommandUserOption) => SlashCommandUserOption)): Omit<this, SlashCommandBuilderSubcommandAddOptionMethods> & SlashCommandSharedPrivateOptions;
    addChannelOption(input: SlashCommandChannelOption|((builder: SlashCommandChannelOption) => SlashCommandChannelOption)): Omit<this, SlashCommandBuilderSubcommandAddOptionMethods> & SlashCommandSharedPrivateOptions;
    addRoleOption(input: SlashCommandRoleOption|((builder: SlashCommandRoleOption) => SlashCommandRoleOption)): Omit<this, SlashCommandBuilderSubcommandAddOptionMethods> & SlashCommandSharedPrivateOptions;
    addAttachmentOption(input: SlashCommandAttachmentOption|((builder: SlashCommandAttachmentOption) => SlashCommandAttachmentOption)): Omit<this, SlashCommandBuilderSubcommandAddOptionMethods> & SlashCommandSharedPrivateOptions;
    addMentionableOption(input: SlashCommandMentionableOption|((builder: SlashCommandMentionableOption) => SlashCommandMentionableOption)): Omit<this, SlashCommandBuilderSubcommandAddOptionMethods> & SlashCommandSharedPrivateOptions;
    addStringOption(input:
        | SlashCommandStringOption
        | Omit<SlashCommandStringOption, 'setAutocomplete'>
        | Omit<SlashCommandStringOption, 'addChoices'>
        | ((builder: SlashCommandStringOption) => SlashCommandStringOption | Omit<SlashCommandStringOption, 'setAutocomplete'> | Omit<SlashCommandStringOption, 'addChoices'>)
    ): Omit<this, SlashCommandBuilderSubcommandAddOptionMethods> & SlashCommandSharedPrivateOptions;
    addIntegerOption(input:
        | SlashCommandIntegerOption
        | Omit<SlashCommandIntegerOption, 'setAutocomplete'>
        | Omit<SlashCommandIntegerOption, 'addChoices'>
        | ((builder: SlashCommandIntegerOption) => SlashCommandIntegerOption | Omit<SlashCommandIntegerOption, 'setAutocomplete'> | Omit<SlashCommandIntegerOption, 'addChoices'>)
    ): Omit<this, SlashCommandBuilderSubcommandAddOptionMethods> & SlashCommandSharedPrivateOptions;
    addNumberOption(input:
        | SlashCommandNumberOption
        | Omit<SlashCommandNumberOption, 'setAutocomplete'>
        | Omit<SlashCommandNumberOption, 'addChoices'>
        | ((builder: SlashCommandNumberOption) => SlashCommandNumberOption | Omit<SlashCommandNumberOption, 'setAutocomplete'> | Omit<SlashCommandNumberOption, 'addChoices'>)
    ): Omit<this, SlashCommandBuilderSubcommandAddOptionMethods> & SlashCommandSharedPrivateOptions;
}

export class SlashCommandBuilder extends Mixin(DiscordJsSlashCommandBuilder, BaseCommandBuilder) implements SlashCommandBuilder {
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

        this.required_member_permissions = bigint ?? undefined;
        Reflect.set(this, 'default_member_permissions', String(bigint));

        return this;
    }

    public toJSON(): SlashCommandBuilderData & { type?: ApplicationCommandType.ChatInput; } {
        return {
            ...super.toJSON(),
            ...super._toJSON<CommandType.SlashCommand, SlashCommandExecuteFunction>()
        }
    }

    public static addOption<Builder extends SharedSlashCommandOptions<any>>(builder: Builder, option: AnySlashCommandOptionBuilder): Builder {
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
        if (client.config.commands?.slashCommand?.acceptRepliedInteractions === false && (interaction.replied || interaction.deferred)) return null;

        const builder = command ? this.resolve(command) : client.commands.get(interaction.commandName, CommandType.SlashCommand);
        if (!builder) return null;

        const executeData: SlashCommandExecuteData = {
            type: builder.command_type,
            builder,
            interaction,
            client
        };

        if (client.config.commands?.slashCommand?.enableCooldown !== false && builder.cooldown) {
            const cooldownData: Omit<CooldownData, 'endsAt'> = {
                commandType: builder.command_type,
                commandName: builder.name,
                userId: interaction.user.id,
                guildId: interaction.guild?.id
            };

            const cooldown = client.cooldowns.findCooldown(cooldownData);

            if (cooldown) {
                await client.commands.executeHalts({
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
            await client.commands.executeHalts({
                reason: CommandHaltReason.PreconditionTrigger,
                commandType: builder.command_type,
                ...commandPreconditionTrigger
            });
            return null;
        }

        return (await client.commands.executeCommandBuilderExecute(executeData)) ? executeData : null;
    }
}

export interface SlashCommandExecuteOptions {
    client: RecipleClient<true>;
    interaction: ChatInputCommandInteraction;
    command?: SlashCommandResolvable;
}

export type SlashCommandResolvable = SlashCommandBuilderData|JSONEncodable<SlashCommandBuilderData>;
export type AnySlashCommandBuilder = Omit<SlashCommandBuilder, SlashCommandBuilderNonSubcommandAddOptionMethods>|Omit<SlashCommandBuilder, SlashCommandBuilderSubcommandAddOptionMethods>|SlashCommandBuilder;
