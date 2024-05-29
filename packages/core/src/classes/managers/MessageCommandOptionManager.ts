import { MessageCommandOptionParseOptionValueOptions, MessageCommandOptionValue } from '../structures/MessageCommandOptionValue.js';
import { MessageCommandBuilder } from '../builders/MessageCommandBuilder.js';
import { RecipleClient } from '../structures/RecipleClient.js';
import { RecipleError } from '../structures/RecipleError.js';
import { Collection, Message } from 'discord.js';
import { DataManager } from './DataManager.js';

export interface MessageCommandOptionManagerOptions {
    command: MessageCommandBuilder;
    client: RecipleClient<true>;
    message: Message;
    args: string[];
    rawArgs: string;
}

export interface MessageCommandOptionManagerParseOptionsData extends Omit<MessageCommandOptionParseOptionValueOptions, 'option'|'value'> {
    command: MessageCommandBuilder;
    args: string[];
    rawArgs: string;
}

export class MessageCommandOptionManager extends DataManager<MessageCommandOptionValue> {
    readonly command: MessageCommandBuilder;
    readonly message: Message;
    readonly args: string[];
    readonly rawArgs: string;

    protected constructor(data: MessageCommandOptionManagerOptions) {
        super(data.client);

        this.command = data.command;
        this.message = data.message;
        this.args = data.args;
        this.rawArgs = data.rawArgs;
    }

    get hasMissingOptions() {
        return this.cache.some(o => o.missing);
    }

    get hasInvalidOptions() {
        return this.cache.some(o => o.invalid);
    }

    public getMissingOptions(): Collection<string, MessageCommandOptionValue> {
        return this.cache.filter(o => o.missing);
    }

    public getInvalidOptions(): Collection<string, MessageCommandOptionValue> {
        return this.cache.filter(o => o.invalid);
    }

    public getOption<V extends any = any>(name: string, required?: false): MessageCommandOptionValue<V>;
    public getOption<V extends any = any>(name: string, required?: true): MessageCommandOptionValue<V>;
    public getOption<V extends any = any>(name: string, required: boolean = false): MessageCommandOptionValue<V>|null {
        const option = this.cache.get(name);
        if (required && !option) throw new RecipleError(`Unable to find required message option '${name}'`);

        return option ?? null;
    }

    public getOptionValue<V extends any = any>(name: string, options?: { required?: false; resolveValue?: false; }): string|null;
    public getOptionValue<V extends any = any>(name: string, options?: { required?: true; resolveValue?: false; }): string;
    public getOptionValue<V extends any = any>(name: string, options?: { required?: true; resolveValue?: true; }): Promise<V>;
    public getOptionValue<V extends any = any>(name: string, options?: { required?: false; resolveValue?: true; }): Promise<V|null>;
    public getOptionValue<V extends any = any>(name: string, options: { required?: boolean; resolveValue?: boolean; } = { required: false, resolveValue: false }): string|null|Promise<V|null> {
        const value = this.getOption<V>(name);
        return options.resolveValue ? Promise.resolve(value.resolveValue(options.required) ?? value.value) : value.value;
    }

    public toJSON() {
        return {
            commandName: this.command.name,
            guildId: this.message.guildId,
            channelId: this.message.channelId,
            messageId: this.message.id,
            args: this.args,
            rawArgs: this.rawArgs
        };
    }

    private async _parseOptions(): Promise<void> {
        if (!this.command.options?.length || !this.client.isReady()) return;

        for (const i in this.command.options) {
            const arg = this.args[i];
            const option = this.command.options[i];
            this._cache.set(option.name, await MessageCommandOptionValue.parseOptionValue({
                client: this.client,
                message: this.message,
                value: arg,
                option
            }));
        }
    }

    public static async parseOptions(options: MessageCommandOptionManagerParseOptionsData): Promise<MessageCommandOptionManager> {
        const manager = new MessageCommandOptionManager({
            command: options.command,
            client: options.client,
            message: options.message,
            args: options.args,
            rawArgs: options.rawArgs
        });

        await manager._parseOptions();

        return manager;
    }
}
