import { MessageCommandOptionParseOptionValueOptions, MessageCommandOptionValue } from '../structures/MessageCommandOptionValue';
import { MessageCommandBuilder } from '../builders/MessageCommandBuilder';
import { RecipleClient } from '../structures/RecipleClient';
import { RecipleError } from '../structures/RecipleError';
import { Collection, Message } from 'discord.js';
import { DataManager } from './DataManager';

export interface MessageCommandOptionManagerOptions {
    command: MessageCommandBuilder;
    client: RecipleClient<true>;
    message: Message;
    args: string[];
}

export interface MessageCommandOptionManagerParseOptionsData extends Omit<MessageCommandOptionParseOptionValueOptions, 'option'|'value'> {
    command: MessageCommandBuilder;
    args: string[];
}

export class MessageCommandOptionManager extends DataManager<MessageCommandOptionValue> {
    readonly command: MessageCommandBuilder;
    readonly message: Message;
    readonly args: string[];

    protected constructor(data: MessageCommandOptionManagerOptions) {
        super(data.client);

        this.command = data.command;
        this.message = data.message;
        this.args = data.args;
    }

    get hasMissingOptions() {
        return this.cache.some(o => o.missing);
    }

    get hasInvalidOptions() {
        return this.cache.some(o => o.value);
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

    public getOptionValue<V extends any = any>(name: string, options: { required?: false; resolveValue?: false; }): string|null;
    public getOptionValue<V extends any = any>(name: string, options: { required?: true; resolveValue?: false; }): string;
    public getOptionValue<V extends any = any>(name: string, options: { required?: true; resolveValue?: true; }): Promise<string|V>;
    public getOptionValue<V extends any = any>(name: string, options: { required?: false; resolveValue?: true; }): Promise<string|V|null>;
    public getOptionValue<V extends any = any>(name: string, options: { required?: boolean; resolveValue?: boolean; } = { required: false, resolveValue: false }): string|null|Promise<V|string|null> {
        const value = this.getOption<V>(name, options.required as false);

        return options.resolveValue ? Promise.resolve(value.resolveValue() ?? value.value) : value.value;
    }

    private async _parseOptions(): Promise<void> {
        if (!this.command.options?.length) return;

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
            args: options.args
        });

        await manager._parseOptions();

        return manager;
    }
}
