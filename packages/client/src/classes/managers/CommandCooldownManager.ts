import { Guild, RestOrArray, TextBasedChannel, User, normalizeArray } from 'discord.js';
import { CommandType } from '../../types/commands';

export interface CommandCooldownData {
    /**
     * Cooled-down user
     */
    user: User;
    /**
     * Command name
     */
    command?: string;
    /**
     * Command type
     */
    type?: CommandType;
    /**
     * Command cooldown guild
     */
    guild?: Guild;
    /**
     * Command cooldown channel
     */
    channel?: TextBasedChannel;
    /**
     * Cooldown end date
     */
    endsAt: Date;
}

export class CommandCooldownManager extends Array<CommandCooldownData> {
    constructor(...data: RestOrArray<CommandCooldownData>) {
        super(...normalizeArray(data));
    }

    public add(...data: RestOrArray<CommandCooldownData>) {
        return this.push(...normalizeArray(data));
    }

    public get(options: Partial<Omit<CommandCooldownData, 'expireTime'>>|string): CommandCooldownData|undefined {
        return this.find(data => typeof options === 'string' ? data.user.id === options : CommandCooldownManager.checkOptions(options, data));
    }

    public isCooledDown(options: Partial<Omit<CommandCooldownData, 'expireTime'>>): boolean {
        const data = this.get(options);
        if (!data) return false;

        this.remove({
            ...data,
            channel: undefined,
            guild: undefined,
            type: undefined,
            command: undefined,
        });

        return data.endsAt.getTime() > Date.now();
    }

    public remove(options: Partial<CommandCooldownData>, limit: number = 0): CommandCooldownData[] {
        if (!Object.keys(options).length) throw new TypeError('Provide atleast one option to remove cooldown data.');

        const removed: CommandCooldownData[] = [];

        for (let i = 0; i < this.length; i++) {
            if (!CommandCooldownManager.checkOptions(options, this[i])) continue;
            if (options.endsAt && this[i].endsAt.getTime() > Date.now()) continue;
            if (limit && i >= limit) continue;

            removed.push(this[i]);
            this.splice(Number(i));
        }

        return removed;
    }

    public clean(options?: Partial<Omit<CommandCooldownData, 'expireTime'>>): void {
        for (const index in this) {
            if (options && !CommandCooldownManager.checkOptions(options, this[index])) return;
            if (this[index].endsAt.getTime() > Date.now()) return;
            this.slice(Number(index));
        }
    }

    public static checkOptions(options: Partial<Omit<CommandCooldownData, 'endsAt'>>, data: CommandCooldownData): boolean {
        if (options?.user !== undefined && options.user.id !== data.user.id) return false;
        if (options?.guild !== undefined && options.guild?.id !== data.guild?.id) return false;
        if (options?.channel !== undefined && options.channel.id !== data.channel?.id) return false;
        if (options?.command !== undefined && options.command !== data.command) return false;
        if (options?.type !== undefined && options.type !== data.type) return false;

        return true;
    }
}
