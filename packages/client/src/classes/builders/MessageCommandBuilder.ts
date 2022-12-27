import { Awaitable, Message, RestOrArray, isValidationEnabled, normalizeArray } from 'discord.js';
import { CommandType, MessageCommandData } from '../../types/builders';
import { BaseCommandBuilder } from './BaseCommandBuilder';
import { CommandHaltData } from '../../types/commandHalt';
import { MessageCommandOptionBuilder, MessageCommandOptionResolvable } from './MessageCommandOptionBuilder';
import { MessageCommandOptionManager } from '../managers/MessageCommandOptionManager';
import { CommandData } from 'fallout-utility';
import { Client } from '../Client';

export type MessageCommandResolvable<Metadata = unknown> = MessageCommandBuilder<Metadata>|MessageCommandData<Metadata>;

export interface MessageCommandExecuteData<Metadata = unknown> {
    type: CommandType.MessageCommand;
    client: Client;
    message: Message;
    options: MessageCommandOptionManager;
    command: CommandData;
    builder: MessageCommandBuilder<Metadata>;
}

export type MessageCommandExecuteFunction<Metadata = unknown> = (data: MessageCommandExecuteData<Metadata>) => Awaitable<void>;

export type MessageCommandHaltData<Metadata = unknown> = CommandHaltData<CommandType.MessageCommand, Metadata>;
export type MessageCommandHaltFunction<Metadata = unknown> = (data: MessageCommandHaltData<Metadata>) => Awaitable<void>;

export class MessageCommandBuilder<Metadata = unknown> extends BaseCommandBuilder<Metadata> {
    readonly type: CommandType.MessageCommand = CommandType.MessageCommand;
    public name!: string;
    public description!: string;
    public aliases: string[] = [];
    public validateOptions: boolean = false;
    public dmPermission: boolean = false;
    public userBotPermission: boolean = false;
    public options: MessageCommandOptionBuilder[] = [];
    public halt?: MessageCommandHaltFunction<Metadata>;
    public execute: MessageCommandExecuteFunction<Metadata> = () => {};

    constructor(data?: Partial<Omit<MessageCommandData<Metadata>, 'type'>>) {
        super();

        if (data?.name !== undefined) this.setName(data.name);
        if (data?.description !== undefined) this.setDescription(data.description);
        if (data?.aliases !== undefined) this.addAliases(data.aliases);
        if (data?.cooldown !== undefined) this.setCooldown(Number(data?.cooldown));
        if (data?.requiredBotPermissions !== undefined) this.setRequiredBotPermissions(data.requiredBotPermissions);
        if (data?.requiredMemberPermissions !== undefined) this.setRequiredMemberPermissions(data.requiredMemberPermissions);
        if (data?.halt !== undefined) this.setHalt(data.halt);
        if (data?.execute !== undefined) this.setExecute(data.execute);
        if (data?.metadata !== undefined) this.setMetadata(data.metadata);
        if (data?.allowExecuteByBots !== undefined) this.setUserBotPermission(data?.allowExecuteByBots);
        if (data?.allowExecuteInDM !== undefined) this.setDmPermission(data?.allowExecuteInDM);
        if (data?.validateOptions !== undefined) this.setValidateOptions(data?.validateOptions);
        if (data?.options !== undefined) this.options = data.options.map(o => MessageCommandOptionBuilder.resolveMessageCommandOption(o));
    }

    public setName(name: string): this {
        if (isValidationEnabled() && (!name || typeof name !== 'string' || !name.match(/^[\w-]{1,32}$/))) throw new TypeError('name must be a string and match the regex /^[\\w-]{1,32}$/');
        this.name = name;
        return this;
    }

    public setDescription(description: string): this {
        if (isValidationEnabled() && (!description || typeof description !== 'string')) throw new TypeError('description must be a string.');
        this.description = description;
        return this;
    }

    public addAliases(...aliases: RestOrArray<string>): this {
        aliases = normalizeArray(aliases);

        if (!aliases.length) throw new TypeError('Provide atleast one alias');
        if (aliases.some(a => !a || typeof a !== 'string' || a.match(/^\s+$/))) throw new TypeError('aliases must be strings and should not contain whitespaces');
        if (this.name && aliases.some(a => a == this.name)) throw new TypeError('alias cannot have same name to its real command name');

        this.aliases = [...new Set(aliases.map(s => s.toLowerCase()))];
        return this;
    }

    public setAliases(...aliases: RestOrArray<string>): this {
        this.aliases = [];

        return this.addAliases(...aliases);
    }

    public setDmPermission(dmPermission: boolean): this {
        this.dmPermission = dmPermission;
        return this;
    }

    public setUserBotPermission(userBotPermission: boolean): this {
        this.userBotPermission = userBotPermission;
        return this;
    }

    public setValidateOptions(validateOptions: boolean): this {
        this.validateOptions = validateOptions;
        return this;
    }

    public addOptions(...options: RestOrArray<MessageCommandOptionResolvable | ((builder: MessageCommandOptionBuilder) => MessageCommandOptionBuilder)>): this {
        for (const optionResolvable of normalizeArray(options)) {
            const option = typeof optionResolvable === 'function'
                ? optionResolvable(new MessageCommandOptionBuilder())
                : MessageCommandOptionBuilder.resolveMessageCommandOption(optionResolvable);

            if (isValidationEnabled()) {
                if (this.options.find(o => o.name === option.name)) throw new TypeError('option with name "' + option.name + '" already exists.');
                if (this.options.length > 0 && !this.options[this.options.length - 1 < 0 ? 0 : this.options.length - 1].required && option.required) throw new TypeError('All required options must be before optional options.');
            }

            this.options.push(option);
        }

        return this;
    }

    public static resolveMessageCommand<Metadata = unknown>(commandData: MessageCommandData<Metadata> | MessageCommandBuilder<Metadata>): MessageCommandBuilder<Metadata> {
        return this.isMessageCommandBuilder<Metadata>(commandData) ? commandData : new MessageCommandBuilder(commandData);
    }

    public static isMessageCommandBuilder<Metadata = unknown>(builder: unknown): builder is MessageCommandBuilder<Metadata> {
        return builder instanceof MessageCommandBuilder;
    }

    public static isMessageCommandExecuteData<Metadata>(executeData: unknown): executeData is MessageCommandExecuteData<Metadata> {
        return (executeData as MessageCommandExecuteData<Metadata>).type == CommandType.MessageCommand && this.isMessageCommandBuilder<Metadata>((executeData as MessageCommandExecuteData).builder);
    }
}
