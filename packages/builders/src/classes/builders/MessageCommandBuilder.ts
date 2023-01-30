import { Awaitable, Message, RestOrArray, isValidationEnabled, normalizeArray } from 'discord.js';
import { AnyCommandExecuteFunction, AnyCommandHaltFunction, BaseCommandData, CommandType } from '../../types/commands';
import { BaseCommandBuilder, BaseCommandBuilderData } from './BaseCommandBuilder';
import { MessageCommandOptionBuilder, MessageCommandOptionResolvable } from './MessageCommandOptionBuilder';
import { MessageCommandOptionManager } from '../managers/MessageCommandOptionManager';
import { CommandData } from 'fallout-utility';
import { Client } from '../Client';
import { CommandHaltData } from '../../types/halt';

export interface MessageCommandExecuteData<Metadata = unknown> {
    commandType: CommandType.MessageCommand;
    client: Client;
    message: Message;
    options: MessageCommandOptionManager;
    command: CommandData;
    builder: MessageCommandBuilder<Metadata>;
}

export type MessageCommandHaltData<Metadata = unknown> = CommandHaltData<CommandType.MessageCommand, Metadata>;

export type MessageCommandExecuteFunction<Metadata = unknown> = (executeData: MessageCommandExecuteData<Metadata>) => Awaitable<void>;
export type MessageCommandHaltFunction<Metadata = unknown> = (haltData: MessageCommandHaltData<Metadata>) => Awaitable<boolean>;

export interface MessageCommandData<Metadata = unknown> extends BaseCommandBuilderData<Metadata>, BaseCommandData {
    
}

export class MessageCommandBuilder<Metadata = unknown> extends BaseCommandBuilder<Metadata> {
    public commandType: CommandType.ContextMenuCommand = CommandType.ContextMenuCommand;
    public name: string = '';
    public aliases: string[] = [];
    public description: string = '';
    public validateOptions: boolean = false;
    public dmPermission: boolean = false;
    public userBotPermission: boolean = false;
    public options: MessageCommandOptionBuilder[] = [];
    public halt?: MessageCommandHaltFunction<Metadata>;
    public execute?: MessageCommandExecuteFunction<Metadata>;

    constructor(data?: Omit<Partial<MessageCommandData<Metadata>>, 'commandType'>) {
        super(data);

        if (data?.name !== undefined) this.setName(data.name);
        if (data?.description !== undefined) this.setDescription(data.description);
    }

    public setName(name: string): this {
        this.name = name;
        return this;
    }

    public addAliases(...aliases: RestOrArray<string>): this {
        aliases = normalizeArray(aliases);

        if (aliases.some(a => !a || typeof a !== 'string' || a.match(/^\s+$/))) throw new TypeError('Aliases must be strings and should not contain whitespaces');
        if (this.name && aliases.some(a => a == this.name)) throw new TypeError('Aliases cannot have same name to its real command name');

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

    public setDescription(name: string): this {
        this.name = name;
        return this;
    }

    public addOptions(...options: RestOrArray<MessageCommandOptionResolvable | ((builder: MessageCommandOptionBuilder) => MessageCommandOptionBuilder)>): this {
        for (const optionResolvable of normalizeArray(options)) {
            this.addOption(optionResolvable);
        }

        return this;
    }

    public setOptions(...options: RestOrArray<MessageCommandOptionResolvable | ((builder: MessageCommandOptionBuilder) => MessageCommandOptionBuilder)>): this {
        this.options = [];
        return this.addOptions(normalizeArray(options));
    }

    public addOption(optionResolvable: MessageCommandOptionResolvable | ((builder: MessageCommandOptionBuilder) => MessageCommandOptionBuilder)): this {
        const option = typeof optionResolvable === 'function'
            ? optionResolvable(new MessageCommandOptionBuilder())
            : MessageCommandOptionBuilder.from(optionResolvable);

        if (isValidationEnabled()) {
            if (this.options.find(o => o.name === option.name)) throw new TypeError('An option with name "' + option.name + '" already exists.');
            if (this.options.length > 0 && !this.options[this.options.length - 1 < 0 ? 0 : this.options.length - 1].required && option.required) throw new TypeError('All required options must be before optional options.');
        }

        this.options.push(option);

        return this;
    }

    public setHalt(halt?: MessageCommandHaltFunction<Metadata>|null): this {
        this.halt = halt || undefined;
        return this;
    }

    public setExecute(execute?: MessageCommandExecuteFunction<Metadata>|null): this {
        this.execute = execute || undefined;
        return this;
    }

    // TODO: public static from
}
