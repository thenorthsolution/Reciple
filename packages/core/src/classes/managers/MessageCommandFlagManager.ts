import type { Message } from 'discord.js';
import type { MessageCommandBuilder } from '../builders/MessageCommandBuilder.js';
import type { MessageCommandFlagValue } from '../structures/MessageCommandFlagValue.js';
import type { RecipleClient } from '../structures/RecipleClient.js';
import { DataManager } from './DataManager.js';
import type { MessageCommandOptionManagerOptions } from './MessageCommandOptionManager.js';
import type { CommandData } from '../../types/structures.js';
import { RecipleError } from '../structures/RecipleError.js';

export class MessageCommandFlagManager extends DataManager<MessageCommandFlagValue> implements MessageCommandOptionManagerOptions {
    readonly command: MessageCommandBuilder;
    readonly client: RecipleClient<true>;
    readonly message: Message;
    readonly parserData: CommandData;

    constructor(data: MessageCommandOptionManagerOptions) {
        super();

        this.command = data.command;
        this.client = data.client;
        this.message = data.message;
        this.parserData = data.parserData;
    }

    get hasMissingFlags() {
        return this.cache.some(o => o.missing);
    }

    get hasInvalidFlags() {
        return this.cache.some(o => o.invalid);
    }

    get hasValidationErrors() {
        return this.cache.some(o => o.error);
    }

    get missingFlags() {
        return this.cache.filter(o => o.missing);
    }

    get invalidFlags() {
        return this.cache.filter(o => o.invalid);
    }

    /**
     * Retrieves the value of a message command flag.
     *
     * @param {string} name - The name of the flag.
     * @param {boolean} required - Whether the flag is required or not.
     * @return {MessageCommandOptionValue<V>|null} The value of the message command flag.
     */
    public getFlag<V extends string|boolean = string|boolean, T extends any = any>(name: string, required: true): MessageCommandFlagValue<V, T>;
    public getFlag<V extends string|boolean = string|boolean, T extends any = any>(name: string, required?: boolean): MessageCommandFlagValue<V, T>|null;
    public getFlag<V extends string|boolean = string|boolean, T extends any = any>(name: string, required: boolean = false): MessageCommandFlagValue<V, T>|null {
        const flag = this.cache.get(name) as MessageCommandFlagValue<V, T>|undefined;
        if (required && !flag) throw new RecipleError(`Unable to find required message flag '${name}'`);

        return flag ?? null;
    }

    /**
     * Obtains the value of a message command flag.
     * @param name The name of the flag.
     * @param options The flags to use when parsing the flag value.
     * @param options.required Whether the flag is required or not.
     * @param options.resolveValue Whether to resolve the value or not.
     */
    public getFlagValues<V extends string|boolean = string|boolean, T extends any = any>(name: string, options?: { required?: boolean; resolveValue?: false; }): V[];
    public getFlagValues<V extends string|boolean = string|boolean, T extends any = any>(name: string, options?: { required?: boolean; resolveValue?: true; }): Promise<T[]>;
    public getFlagValues<V extends string|boolean = string|boolean, T extends any = any>(name: string, options?: { required?: boolean; resolveValue?: boolean; }): Promise<T[]>|V[];
    public getFlagValues<V extends string|boolean = string|boolean, T extends any = any>(name: string, options: { required?: boolean; resolveValue?: boolean; } = { required: false, resolveValue: false }): Promise<T[]>|V[] {
        const value = this.getFlag<V>(name, options.required);
        return options.resolveValue
            ? Promise.resolve(value?.resolveValues()).then(v => v ?? [])
            : value?.values ?? [];
    }
}
