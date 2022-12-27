import { Awaitable, SlashCommandAttachmentOption, SlashCommandBooleanOption, SlashCommandBuilder as DiscordJsSlashCommandBuilder, SlashCommandChannelOption, SlashCommandIntegerOption, SlashCommandMentionableOption, SlashCommandNumberOption, SlashCommandRoleOption, SlashCommandStringOption, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandUserOption, ApplicationCommandOptionType, SharedSlashCommandOptions, ChatInputCommandInteraction } from 'discord.js';
import { BaseCommandBuilder } from './BaseCommandBuilder';
import { isClass } from 'fallout-utility';
import { mix } from 'ts-mixer';
import { AnySlashCommandOptionBuilder, AnySlashCommandOptionData, AnySlashCommandOptionsOnlyOptionBuilder, CommandType, SlashCommandData } from '../../types/builders';
import { CommandHaltData } from '../../types/commandHalt';
import { Client } from '../Client';

export type SlashCommandResolvable<Metadata = unknown> = SlashCommandBuilder<Metadata>|SlashCommandData<Metadata>;

export interface SlashCommandExecuteData<Metadata = unknown> {
    type: CommandType.MessageCommand;
    client: Client;
    interaction: ChatInputCommandInteraction;
    builder: SlashCommandBuilder<Metadata>;
}

export type SlashCommandExecuteFunction<Metadata = unknown> = (data: SlashCommandExecuteData<Metadata>) => Awaitable<void>;

export type SlashCommandHaltData<Metadata = unknown> = CommandHaltData<CommandType.SlashCommand, Metadata>;
export type SlashCommandHaltFunction<Metadata = unknown> = (data: SlashCommandHaltData) => Awaitable<void>;

export type SlashCommandSubcommandsOnlyBuilder<Metadata = unknown>  = Omit<SlashCommandBuilder<Metadata>, 'addBooleanOption' | 'addUserOption' | 'addChannelOption' | 'addRoleOption' | 'addAttachmentOption' | 'addMentionableOption' | 'addStringOption' | 'addIntegerOption' | 'addNumberOption'>;
export type SlashCommandOptionsOnlyBuilder<Metadata = unknown> = Omit<SlashCommandBuilder<Metadata>, 'addSubcommand' | 'addSubcommandGroup'>;

export interface SlashCommandBuilder<Metadata = unknown> extends DiscordJsSlashCommandBuilder, BaseCommandBuilder<Metadata> {
    addSubcommandGroup(input: SlashCommandSubcommandGroupBuilder | ((subcommandGroup: SlashCommandSubcommandGroupBuilder) => SlashCommandSubcommandGroupBuilder)): SlashCommandSubcommandsOnlyBuilder;
    addSubcommand(input: SlashCommandSubcommandBuilder | ((subcommandGroup: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder)): SlashCommandSubcommandsOnlyBuilder;

    addBooleanOption(input: SlashCommandBooleanOption | ((builder: SlashCommandBooleanOption) => SlashCommandBooleanOption)): Omit<this, 'addSubcommand' | 'addSubcommandGroup'>;
    addUserOption(input: SlashCommandUserOption | ((builder: SlashCommandUserOption) => SlashCommandUserOption)): Omit<this, 'addSubcommand' | 'addSubcommandGroup'>;
    addChannelOption(input: SlashCommandChannelOption | ((builder: SlashCommandChannelOption) => SlashCommandChannelOption)): Omit<this, 'addSubcommand' | 'addSubcommandGroup'>;
    addRoleOption(input: SlashCommandRoleOption | ((builder: SlashCommandRoleOption) => SlashCommandRoleOption)): Omit<this, 'addSubcommand' | 'addSubcommandGroup'>;
    addAttachmentOption(input: SlashCommandAttachmentOption | ((builder: SlashCommandAttachmentOption) => SlashCommandAttachmentOption)): Omit<this, 'addSubcommand' | 'addSubcommandGroup'>;
    addMentionableOption(input: SlashCommandMentionableOption | ((builder: SlashCommandMentionableOption) => SlashCommandMentionableOption)): Omit<this, 'addSubcommand' | 'addSubcommandGroup'>;
    addStringOption(
        input:
            | SlashCommandStringOption
            | Omit<SlashCommandStringOption, 'setAutocomplete'>
            | Omit<SlashCommandStringOption, 'addChoices'>
            | ((builder: SlashCommandStringOption) => SlashCommandStringOption | Omit<SlashCommandStringOption, 'setAutocomplete'> | Omit<SlashCommandStringOption, 'addChoices'>)
    ): Omit<this, 'addSubcommand' | 'addSubcommandGroup'>;
    addIntegerOption(
        input:
            | SlashCommandIntegerOption
            | Omit<SlashCommandIntegerOption, 'setAutocomplete'>
            | Omit<SlashCommandIntegerOption, 'addChoices'>
            | ((builder: SlashCommandIntegerOption) => SlashCommandIntegerOption | Omit<SlashCommandIntegerOption, 'setAutocomplete'> | Omit<SlashCommandIntegerOption, 'addChoices'>)
    ): Omit<this, 'addSubcommand' | 'addSubcommandGroup'>;
    addNumberOption(
        input:
            | SlashCommandNumberOption
            | Omit<SlashCommandNumberOption, 'setAutocomplete'>
            | Omit<SlashCommandNumberOption, 'addChoices'>
            | ((builder: SlashCommandNumberOption) => SlashCommandNumberOption | Omit<SlashCommandNumberOption, 'setAutocomplete'> | Omit<SlashCommandNumberOption, 'addChoices'>)
    ): Omit<this, 'addSubcommand' | 'addSubcommandGroup'>;
}

@mix(DiscordJsSlashCommandBuilder, BaseCommandBuilder)
export class SlashCommandBuilder<Metadata = unknown> {
    readonly type: CommandType.SlashCommand = CommandType.SlashCommand;
    public halt?: SlashCommandHaltFunction<Metadata>;
    public execute: SlashCommandExecuteFunction<Metadata> = () => {};

    constructor(data?: Partial<Omit<SlashCommandData<Metadata>, 'type'>>) {
        if (data?.name !== undefined) this.setName(data.name);
        if (data?.description !== undefined) this.setDescription(data.description);
        if (data?.cooldown !== undefined) this.setCooldown(Number(data?.cooldown));
        if (data?.requiredBotPermissions !== undefined) this.setRequiredBotPermissions(data.requiredBotPermissions || null);
        if (data?.requiredMemberPermissions !== undefined) this.setRequiredMemberPermissions(data.requiredMemberPermissions || null);
        if (data?.halt !== undefined) this.setHalt(data.halt);
        if (data?.execute !== undefined) this.setExecute(data.execute);
        if (data?.metadata !== undefined) this.setMetadata(data.metadata);
        if (data?.nameLocalizations !== undefined) this.setNameLocalizations(data.nameLocalizations);
        if (data?.descriptionLocalizations !== undefined) this.setDescriptionLocalizations(data.descriptionLocalizations);
        if (data?.defaultMemberPermissions !== undefined) this.setDefaultMemberPermissions(data.defaultMemberPermissions);
        if (data?.dmPermission !== undefined) this.setDMPermission(true);
        if (data?.defaultPermission !== undefined) this.setDefaultPermission(true);
        if (data?.options) {
            for (const option of data.options) {
                SlashCommandBuilder.addOption(this, isClass<AnySlashCommandOptionBuilder>(option) ? option : SlashCommandBuilder.resolveOption(option as AnySlashCommandOptionData));
            }
        }
    }

    public static addOption(builder: SharedSlashCommandOptions|SlashCommandBuilder, option: AnySlashCommandOptionBuilder): SharedSlashCommandOptions {
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

    public static resolveOption<T extends AnySlashCommandOptionBuilder>(option: AnySlashCommandOptionData): T {
        let builder: AnySlashCommandOptionBuilder;

        // TODO: I can do better than this

        switch (option.type) {
            case ApplicationCommandOptionType.Attachment:
                builder = new SlashCommandAttachmentOption();
                break;
            case ApplicationCommandOptionType.Boolean:
                builder = new SlashCommandBooleanOption();
                break;
            case ApplicationCommandOptionType.Channel:
                builder = new SlashCommandChannelOption().addChannelTypes(...(option.channelTypes ?? []));
                break;
            case ApplicationCommandOptionType.Integer:
                builder = new SlashCommandIntegerOption().addChoices(...(option.choices ?? [])).setAutocomplete(!!option.autocomplete);

                if (option.maxValue) builder.setMaxValue(option.maxValue);
                if (option.minValue) builder.setMinValue(option.minValue);

                break;
            case ApplicationCommandOptionType.Mentionable:
                builder = new SlashCommandMentionableOption();
                break;
            case ApplicationCommandOptionType.Number:
                builder = new SlashCommandNumberOption().addChoices(...(option.choices ?? [])).setAutocomplete(!!option.autocomplete);

                if (option.maxValue) builder.setMaxValue(option.maxValue);
                if (option.minValue) builder.setMinValue(option.minValue);

                break;
            case ApplicationCommandOptionType.Role:
                builder = new SlashCommandRoleOption();
                break;
            case ApplicationCommandOptionType.String:
                builder = new SlashCommandStringOption().addChoices(...(option.choices ?? [])).setAutocomplete(!!option.autocomplete);

                if (option.maxLength) builder.setMaxLength(option.maxLength);
                if (option.minLength) builder.setMinLength(option.minLength);

                break;
            case ApplicationCommandOptionType.User:
                builder = new SlashCommandUserOption();
                break;
            case ApplicationCommandOptionType.Subcommand:
                builder = new SlashCommandSubcommandBuilder();

                for (const optionData of option.options) {
                    this.addOption(builder, this.resolveOption<AnySlashCommandOptionsOnlyOptionBuilder>(optionData));
                }

                break;
            case ApplicationCommandOptionType.SubcommandGroup:
                builder = new SlashCommandSubcommandGroupBuilder();

                for (const subCommandData of option.options) {
                    builder.addSubcommand(subCommandData instanceof SlashCommandSubcommandBuilder ? subCommandData : this.resolveOption<SlashCommandSubcommandBuilder>(subCommandData));
                }

                break;
            default:
                throw new TypeError('Unknown option data');
        }

        if (!(builder instanceof SlashCommandSubcommandBuilder) && !(builder instanceof SlashCommandSubcommandGroupBuilder) && option.type !== ApplicationCommandOptionType.Subcommand && option.type !== ApplicationCommandOptionType.SubcommandGroup) {
            builder.setRequired(option.required ?? false);
        }

        return builder
            .setName(option.name)
            .setDescription(option.description)
            .setNameLocalizations(option.nameLocalizations ?? null)
            .setDescriptionLocalizations(option.descriptionLocalizations ?? null) as T;
    }
}
