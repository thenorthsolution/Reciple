import { CommandType, CommandHaltFunction, CommandExecuteFunction, SharedCommandBuilderProperties, AnySlashCommandBuilder, SlashCommandData, AnySlashCommandOptionData, AnySlashCommandOptionBuilder, AnySlashCommandOptionsOnlyOptionBuilder } from '../../types/builders';
import { BaseCommandExecuteData, CommandHaltData } from '../../types/commands';
import { isClass } from '../../util';

import {
    ChatInputCommandInteraction,
    normalizeArray,
    PermissionResolvable,
    RestOrArray,
    SlashCommandBuilder as DiscordJsSlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandSubcommandGroupBuilder,
    SlashCommandBooleanOption,
    SlashCommandUserOption,
    SlashCommandChannelOption,
    SlashCommandRoleOption,
    SlashCommandAttachmentOption,
    SlashCommandMentionableOption,
    SlashCommandStringOption,
    SlashCommandIntegerOption,
    SlashCommandNumberOption,
    ApplicationCommandOptionType,
    SharedSlashCommandOptions,
    PermissionsBitField,
    isValidationEnabled,
} from 'discord.js';

/**
 * Execute data for slash command
 */
export interface SlashCommandExecuteData<T = unknown> extends BaseCommandExecuteData {
    /**
     * Command type
     */
    type: CommandType.SlashCommand;
    /**
     * Command interaction
     */
    interaction: ChatInputCommandInteraction;
    /**
     * Command Builder
     */
    builder: AnySlashCommandBuilder<T>;
}

/**
 * Slash command halt data
 */
export type SlashCommandHaltData<T = unknown> = CommandHaltData<CommandType.SlashCommand, T>;

/**
 * Slash command halt function
 */
export type SlashCommandHaltFunction<T = unknown> = CommandHaltFunction<CommandType.SlashCommand, T>;

/**
 * Slash command execute function
 */
export type SlashCommandExecuteFunction<T = unknown> = CommandExecuteFunction<CommandType.SlashCommand, T>;

export type SlashCommandSubcommandsOnlyBuilder<T = unknown> = Omit<SlashCommandBuilder<T>, 'addBooleanOption' | 'addUserOption' | 'addChannelOption' | 'addRoleOption' | 'addAttachmentOption' | 'addMentionableOption' | 'addStringOption' | 'addIntegerOption' | 'addNumberOption'>;
export type SlashCommandOptionsOnlyBuilder<T = unknown> = Omit<SlashCommandBuilder<T>, 'addSubcommand' | 'addSubcommandGroup'>;

export interface SlashCommandBuilder<T = unknown> extends DiscordJsSlashCommandBuilder {
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

/**
 * Reciple builder for slash command
 */
export class SlashCommandBuilder<T = unknown> extends DiscordJsSlashCommandBuilder implements SharedCommandBuilderProperties<T> {
    public readonly type = CommandType.SlashCommand;
    protected _cooldown: number = 0;
    protected _requiredBotPermissions: PermissionResolvable[] = [];
    protected _requiredMemberPermissions: PermissionResolvable[] = [];
    protected _halt?: SlashCommandHaltFunction<T>;
    protected _execute: SlashCommandExecuteFunction<T> = () => {
        /* Execute */
    };
    public metadata?: T;

    get cooldown(): typeof this._cooldown {
        return this._cooldown;
    }
    get requiredBotPermissions(): typeof this._requiredBotPermissions {
        return this._requiredBotPermissions;
    }
    get requiredMemberPermissions(): typeof this._requiredMemberPermissions {
        return this._requiredMemberPermissions;
    }
    get halt(): typeof this._halt {
        return this._halt;
    }
    get execute(): typeof this._execute {
        return this._execute;
    }

    set cooldown(cooldown: typeof this._cooldown) {
        this.setCooldown(cooldown);
    }
    set requiredBotPermissions(permissions: typeof this._requiredBotPermissions) {
        this.setRequiredBotPermissions(permissions);
    }
    set requiredMemberPermissions(permissions: typeof this._requiredMemberPermissions) {
        this.setRequiredMemberPermissions(permissions);
    }
    set halt(halt: typeof this._halt) {
        this.setHalt(halt);
    }
    set execute(execute: typeof this._execute) {
        this.setExecute(execute);
    }

    constructor(data?: Partial<Omit<SlashCommandData<T>, 'type'>>) {
        super();

        // TODO: WTH

        if (data?.name !== undefined) this.setName(data.name);
        if (data?.description !== undefined) this.setDescription(data.description);
        if (data?.cooldown !== undefined) this.setCooldown(Number(data?.cooldown));
        if (data?.requiredBotPermissions !== undefined) this.setRequiredBotPermissions(data.requiredBotPermissions);
        if (data?.requiredMemberPermissions !== undefined) this.setRequiredMemberPermissions(data.requiredMemberPermissions);
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

    public setCooldown(cooldown: number): this {
        this._cooldown = cooldown;
        return this;
    }

    public setRequiredBotPermissions(...permissions: RestOrArray<PermissionResolvable>): this {
        this._requiredBotPermissions = normalizeArray(permissions);
        return this;
    }

    public setRequiredMemberPermissions(...permissions: RestOrArray<PermissionResolvable>): this {
        this._requiredMemberPermissions = normalizeArray(permissions);
        this.setDefaultMemberPermissions(this.requiredMemberPermissions.length ? new PermissionsBitField(this.requiredMemberPermissions).bitfield : undefined);
        return this;
    }

    public setHalt(halt?: SlashCommandHaltFunction<T> | null): this {
        this._halt = halt || undefined;
        return this;
    }

    public setExecute(execute: SlashCommandExecuteFunction<T>): this {
        if (isValidationEnabled() && (!execute || typeof execute !== 'function')) throw new Error('execute must be a function.');
        this._execute = execute;
        return this;
    }

    public setMetadata(metadata?: T): this {
        this.metadata = metadata;
        return this;
    }

    /**
     * Add option builder to command builder
     * @param builder Command/Subcommand builder
     * @param option Option builder
     */
    public static addOption(builder: SharedSlashCommandOptions | SlashCommandBuilder, option: AnySlashCommandOptionBuilder): SharedSlashCommandOptions {
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

    /**
     * Resolve option data
     * @param option Option dara to resolve
     */
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

    /**
     * Resolve slash command data/builder
     * @param commandData Command data to resolve
     */
    public static resolveSlashCommand<T = unknown>(commandData: SlashCommandData<T> | AnySlashCommandBuilder<T>): AnySlashCommandBuilder<T> {
        return this.isSlashCommandBuilder<T>(commandData) ? commandData : new SlashCommandBuilder<T>(commandData);
    }

    /**
     * Is a slash command builder
     * @param builder data to check
     */
    public static isSlashCommandBuilder<T = unknown>(builder: unknown): builder is AnySlashCommandBuilder<T> {
        return builder instanceof SlashCommandBuilder;
    }

    /**
     * Is a slash command execute data
     * @param executeData data to check
     */
    public static isSlashCommandExecuteData(executeData: unknown): executeData is SlashCommandExecuteData {
        return (executeData as SlashCommandExecuteData).builder !== undefined && this.isSlashCommandBuilder((executeData as SlashCommandExecuteData).builder);
    }
}
