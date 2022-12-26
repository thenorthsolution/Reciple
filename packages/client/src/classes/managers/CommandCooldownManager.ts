import { Collection, Guild, RestOrArray, TextBasedChannel, User, normalizeArray } from 'discord.js';
import { CommandType } from '../../types/builders';
import { randomUUID } from 'crypto';

export interface CommandCooldownData {
    id: string;
    userId: string;
    expireAt: number;
    command?: string;
    type?: CommandType;
    guild?: Guild;
    channel?: TextBasedChannel;
}

export class CommandCooldownManager extends Collection<string, CommandCooldownData> {
    constructor(...values: RestOrArray<CommandCooldownData>) {
        super();

        normalizeArray(values).forEach(value => this.add(value));
    }

    public add(data: CommandCooldownData & { id?: string; }): string {
        data.id = data?.id ?? randomUUID();

        this.set(data.id, data);
        return data.id;
    }

    public clean(filter?: Partial<CommandCooldownData>): number {
        return this.sweep(data => data.expireAt >= Date.now() && (!filter || CommandCooldownManager.checkOptions(data, filter)));
    }

    public isCooledDown(filter: Partial<CommandCooldownData>): boolean {
        const data = this.find(value => CommandCooldownManager.checkOptions(value, filter));
        if (!data) return false;
        if (data.expireAt < Date.now()) return false;
        return true;
    }

    public static checkOptions(data: CommandCooldownData, options: Partial<Omit<CommandCooldownData, 'expireTime'>>): boolean {
        if (options?.userId !== undefined && options.userId !== data.userId) return false;
        if (options?.guild !== undefined && options.guild?.id !== data.guild?.id) return false;
        if (options?.channel !== undefined && options.channel.id !== data.channel?.id) return false;
        if (options?.command !== undefined && options.command !== data.command) return false;
        if (options?.type !== undefined && options.type !== data.type) return false;

        return true;
    }
}
