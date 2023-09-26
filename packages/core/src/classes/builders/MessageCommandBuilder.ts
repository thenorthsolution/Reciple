import { Awaitable, JSONEncodable, RestOrArray, Message, normalizeArray, isJSONEncodable } from 'discord.js';
import { CommandType } from '../../types/constants';
import { MessageCommandValidators } from '../validators/MessageCommandValidators';
import { BaseCommandBuilder, BaseCommandBuilderData } from './BaseCommandBuilder';
import { MessageCommandOptionBuilder, MessageCommandOptionResolvable } from './MessageCommandOptionBuilder';
import { MessageCommandOptionValidators } from '../validators/MessageCommandOptionValidators';
import { CommandHaltData } from '../../types/structures';
import { RecipleClient } from '../structures/RecipleClient';
import { MessageCommandOptionManager } from '../managers/MessageCommandOptionManager';

export interface MessageCommandExecuteData {
    type: CommandType.MessageCommand;
    client: RecipleClient<true>;
    message: Message<boolean>;
    options: MessageCommandOptionManager;
    builder: MessageCommandBuilder;
}

export type MessageCommandHaltData = CommandHaltData<CommandType.MessageCommand>;

export type MessageCommandExecuteFunction = (executeData: MessageCommandExecuteData) => Awaitable<void>;
export type MessageCommandHaltFunction = (haltData: MessageCommandHaltData) => Awaitable<boolean>;

export interface MessageCommandBuilderData extends BaseCommandBuilderData {
    command_type: CommandType.MessageCommand;
    name: string;
    description: string;
    aliases?: string[];
    /**
     * @default true
     */
    parse_options?: boolean;
    /**
     * @default false
     */
    dm_permission?: boolean;
    /**
     * @default false
     */
    allow_bot?: boolean;
    options?: MessageCommandOptionResolvable[];
}

export interface MessageCommandBuilder extends BaseCommandBuilder {
    halt?: MessageCommandHaltFunction;
    execute: MessageCommandExecuteFunction;
}

export class MessageCommandBuilder extends BaseCommandBuilder {
    public readonly command_type: CommandType.MessageCommand = CommandType.MessageCommand;
    public name: string = '';
    public description: string = '';
    public aliases?: string[] = [];
    public parse_options?: boolean = true;
    public dm_permission?: boolean = false;
    public allow_bot?: boolean = false;
    public options?: MessageCommandOptionBuilder[] = [];

    constructor(data?: Omit<Partial<MessageCommandBuilderData>, 'command_type'>) {
        super(data);

        if (data?.name) this.setName(data.name);
        if (data?.description) this.setDescription(data.description);
        if (data?.aliases) this.setAliases(data.aliases);
        if (data?.parse_options) this.setParseOptions(data.parse_options);
        if (data?.dm_permission) this.setDMPermission(data.dm_permission);
        if (data?.allow_bot) this.setAllowBot(data.allow_bot);
        if (data?.options) this.setOptions(data.options);
    }

    public setName(name: string): this {
        MessageCommandValidators.isValidName(name);
        this.name = name;
        return this;
    }

    public setDescription(description: string): this {
        MessageCommandValidators.isValidDescription(description);
        this.description = description;
        return this;
    }

    public addAliases(...aliases: RestOrArray<string>): this {
        aliases = normalizeArray(aliases);
        MessageCommandValidators.isValidAliases(aliases);
        this.aliases?.push(...aliases);
        return this;
    }

    public setAliases(...aliases: RestOrArray<string>): this {
        aliases = normalizeArray(aliases);
        MessageCommandValidators.isValidAliases(aliases);
        this.aliases = aliases;
        return this;
    }

    public setParseOptions(enabled: boolean): this {
        MessageCommandValidators.isValidParseOptions(enabled);
        this.parse_options = enabled;
        return this;
    }

    public setDMPermission(DMPermission: boolean): this {
        MessageCommandValidators.isValidDMPermission(DMPermission);
        this.dm_permission = DMPermission;
        return this;
    }

    public setAllowBot(enabled: boolean): this {
        MessageCommandValidators.isValidAllowBot(enabled);
        this.allow_bot = enabled;
        return this;
    }

    public addOption(option: MessageCommandOptionResolvable|((builder: MessageCommandOptionBuilder) => MessageCommandOptionBuilder)): this {
        option = typeof option === 'function' ? option(new MessageCommandOptionBuilder()) : MessageCommandOptionBuilder.from(option);
        MessageCommandOptionValidators.isValidMessageCommandOptionResolvable(option);
        this.options?.push(MessageCommandOptionBuilder.resolve(option));
        return this;
    }

    public setOptions(...options: RestOrArray<MessageCommandOptionResolvable|((builder: MessageCommandOptionBuilder) => MessageCommandOptionBuilder)>): this {
        options = normalizeArray(options);
        MessageCommandValidators.isValidOptions(options);
        this.options = options.map(o => MessageCommandOptionBuilder.resolve(o));
        return this;
    }

    public toJSON(): MessageCommandBuilderData {
        return {
            name: this.name,
            description: this.description,
            aliases: this.aliases,
            parse_options: this.parse_options,
            dm_permission: this.dm_permission,
            allow_bot: this.allow_bot,
            options: this.options,
            ...super._toJSON()
        };
    }

    public static from(data: MessageCommandResolvable): MessageCommandBuilder {
        return new MessageCommandBuilder(isJSONEncodable(data) ? data.toJSON() : data);
    }

    public static resolve(data: MessageCommandResolvable): MessageCommandBuilder {
        return data instanceof MessageCommandBuilder ? data : this.from(data);
    }
}

export type MessageCommandResolvable = MessageCommandBuilderData|JSONEncodable<MessageCommandBuilderData>;
