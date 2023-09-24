import { Guild, RestOrArray, TextBasedChannel, User, normalizeArray } from 'discord.js';
import { CommandType } from '../../types/commands';

export interface CommandCooldownData {
    /**
     * The user who is on cooldown.
     */
    user: User;
    /**
     * The name of the command that is on cooldown.
     */
    command?: string;
    /**
     * The type of command that is on cooldown.
     */
    type?: CommandType;
    /**
     * The guild where the command cooldown is active.
     */
    guild?: Guild;
    /**
     * The channel where the command cooldown is active.
     */
    channel?: TextBasedChannel;
    /**
     * The date and time when the command cooldown will expire.
     */
    endsAt: Date;
}

export class CommandCooldownManager extends Array<CommandCooldownData> {
    private _sweeperTimer?: NodeJS.Timeout;

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
            if (this[i].endsAt.getTime() > Date.now()) continue;
            if (limit && i >= limit) continue;

            removed.push(this[i]);
            this.splice(i, 1);
        }

        return removed;
    }

    public clean(options?: Partial<Omit<CommandCooldownData, 'expireTime'>>): void {
        for (let i = 0; i < this.length; i++) {
            if (!this[i] || options && !CommandCooldownManager.checkOptions(options, this[i])) return;
            if (this[i].endsAt.getTime() > Date.now()) return;
            this.splice(i, 1);
        }
    }

    public setSweeperTimer(timer?: number|null): void {
        if (this._sweeperTimer !== undefined) {
            clearInterval(this._sweeperTimer);
            this._sweeperTimer = undefined;
        }

        if (!timer) return;

        this._sweeperTimer = setInterval(() => this.clean(), timer);
        this._sweeperTimer.unref();
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
