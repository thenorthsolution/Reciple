import { Cooldown, type CooldownData } from '../structures/Cooldown.js';
import type { RecipleClient } from '../structures/RecipleClient.js';
import { DataManager } from './DataManager.js';

export interface CooldownSweeperOptions {
    timer: number;
    maxAgeMs?: number;
    filter?: (cooldown: Cooldown) => boolean;
}

export class CooldownManager extends DataManager<Cooldown> {
    private _sweeper?: NodeJS.Timeout;

    constructor(readonly client: RecipleClient) {
        super();
    }

    public create(data: CooldownData): Cooldown {
        const isExists = this.findCooldown(data);
        if (isExists) return isExists;

        const cooldown = new Cooldown(data, this);
        this._cache.set(cooldown.id, cooldown);

        return cooldown;
    }

    public findCooldown(userId: string): Cooldown|undefined;
    public findCooldown(data: Partial<Omit<CooldownData, 'endsAt'>>): Cooldown|undefined;
    public findCooldown(dataResolvable: string|Partial<Omit<CooldownData, 'endsAt'>>): Cooldown|undefined {
        const data: Partial<Omit<CooldownData, 'endsAt'>> = typeof dataResolvable === 'string' ? { userId: dataResolvable } : dataResolvable;

        return this.cache.find(d => {
            if (data.userId && d.userId !== data.userId) return false;
            if (data.channelId && d.channelId !== data.channelId) return false;
            if (data.guildId && d.guildId !== data.guildId) return false;
            if (data.commandName && d.commandName !== data.commandName) return false;
            if (data.commandType && d.commandType !== data.commandType) return false;

            if (d.isEnded()) {
                this._cache.delete(d.id);
                return false;
            }

            return true;
        });
    }

    public clean(): void {
        this._cache.sweep(c => c.isEnded());
    }

    public setCooldownSweeper(options: CooldownSweeperOptions): NodeJS.Timeout {
        if (this._sweeper) clearInterval(this._sweeper);

        return this._sweeper = setInterval(
            () => this._cache.sweep(c => c.isEnded() || (!options?.maxAgeMs || (Date.now() - c.createdAt.getTime()) >= options.maxAgeMs) || (!options.filter || options.filter(c))),
            options.timer
        ).unref();
    }

    public toJSON(): CooldownData[] {
        return this.cache.map(c => c.toJSON());
    }
}
