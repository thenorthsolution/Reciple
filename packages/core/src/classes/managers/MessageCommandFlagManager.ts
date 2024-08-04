import type { Message } from 'discord.js';
import type { MessageCommandBuilder } from '../builders/MessageCommandBuilder.js';
import { MessageCommandFlagValue, type MessageCommandFlagParseOptionValueOptions } from '../structures/MessageCommandFlagValue.js';
import type { RecipleClient } from '../structures/RecipleClient.js';
import { DataManager } from './DataManager.js';
import type { MessageCommandOptionManagerOptions } from './MessageCommandOptionManager.js';
import type { CommandData } from '../../types/structures.js';
import { RecipleError } from '../structures/RecipleError.js';

export interface MessageCommandFlagManagerParseOptionsData extends Omit<MessageCommandFlagParseOptionValueOptions, 'flag'|'values'> {
    command: MessageCommandBuilder;
    parserData: CommandData;
}

export class MessageCommandFlagManager extends DataManager<MessageCommandFlagValue> implements MessageCommandOptionManagerOptions {
    readonly command: MessageCommandBuilder;
    readonly client: RecipleClient<true>;
    readonly message: Message;
    readonly parserData: CommandData;

    get rawFlags() { return this.parserData.flags; }

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
    public getFlag<T extends any = string|boolean>(name: string, required: true): MessageCommandFlagValue<T>;
    public getFlag<T extends any = string|boolean>(name: string, required?: boolean): MessageCommandFlagValue<T>|null;
    public getFlag<T extends any = string|boolean>(name: string, required: boolean = false): MessageCommandFlagValue<T>|null {
        const flag = this.cache.get(name) as MessageCommandFlagValue<T>|undefined;
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
    public getFlagValues<T extends any = string|boolean, V extends 'string'|'boolean' = 'string'|'boolean'>(name: string, options?: { required?: boolean; resolveValue?: false; type?: V }): V extends 'string' ? string[] : V extends 'boolean' ? boolean[] : string[]|boolean[];
    public getFlagValues<T extends any = string|boolean>(name: string, options?: { required?: boolean; resolveValue?: true; }): Promise<T[]>;
    public getFlagValues<T extends any = string|boolean, V extends 'string'|'boolean' = 'string'|'boolean'>(name: string, options?: { required?: boolean; resolveValue?: boolean; type?: V }): Promise<T[]>|(V extends 'string' ? string[] : V extends 'boolean' ? boolean[] : string[]|boolean[]);
    public getFlagValues<T extends any = string|boolean>(name: string, options: { required?: boolean; resolveValue?: boolean; type?: 'string'|'boolean' } = { required: false, resolveValue: false }): Promise<T[]>|string[]|boolean[] {
        const value = this.getFlag<T>(name, options.required);
        return options.resolveValue
            ? Promise.resolve(value?.resolveValues()).then(v => v ?? [])
            : value?.values ?? [];
    }

    private async _parseFlags(): Promise<void> {
        if (!this.command.flags?.length || !this.client.isReady()) return;

        for (const data of this.command.flags) {
            const flag = this.rawFlags.find(f => f.name === data.name);
            this._cache.set(data.name, await MessageCommandFlagValue.parseFlagValue({
                client: this.client,
                message: this.message,
                command: this.command,
                parserData: this.parserData,
                values: flag?.value,
                flag: data
            }));
        }
    }

    public static async parseFlags(options: MessageCommandFlagManagerParseOptionsData): Promise<MessageCommandFlagManager> {
        const manager = new MessageCommandFlagManager(options);

        await manager._parseFlags();
        return manager;
    }
}
