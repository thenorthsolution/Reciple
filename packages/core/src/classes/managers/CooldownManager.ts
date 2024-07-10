import { isJSONEncodable } from 'discord.js';
import { Cooldown, type CooldownData, type CooldownResolvable } from '../structures/Cooldown.js';
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

    /**
     * Creates a new Cooldown object based on the provided data.
     *
     * @param {CooldownResolvable} data - The data to create the Cooldown from.
     * @return {Cooldown} The newly created Cooldown object.
     */
    public create(data: CooldownResolvable): Cooldown {
        const cooldownData = isJSONEncodable(data) ? data.toJSON() : data;
        const isExists = this.findCooldown(cooldownData);
        if (isExists) return isExists;

        const cooldown = new Cooldown(cooldownData, this);
        this._cache.set(cooldown.id, cooldown);

        return cooldown;
    }

    /**
     * A description of the entire function.
     *
     * @param {string|Partial<Omit<CooldownData, 'endsAt'>>} dataResolvable - The data to find the Cooldown based on.
     * @return {Cooldown|undefined} The found Cooldown object or undefined if not found.
     */
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

    /**
     * Sweeps the cache based on the provided options.
     *
     * @param {Partial<CooldownSweeperOptions>} options - The options for sweeping the cache.
     * @return {void} 
     */
    public clean(options?: Partial<CooldownSweeperOptions>): void {
        this._cache.sweep(c =>
            c.isEnded() ||
            !!(options?.maxAgeMs && (Date.now() - c.createdAt.getTime()) >= options.maxAgeMs) ||
            !!(options?.filter && options.filter(c))
        );
    }

    /**
     * Sets up a cooldown sweeper based on the provided options.
     *
     * @param {CooldownSweeperOptions} options - The options for the cooldown sweeper.
     * @return {NodeJS.Timeout} The NodeJS Timeout object representing the interval.
     */
    public setCooldownSweeper(options: CooldownSweeperOptions): NodeJS.Timeout {
        if (this._sweeper) clearInterval(this._sweeper);
        return this._sweeper = setInterval(() => this.clean(options), options.timer).unref();
    }

    public toJSON(): CooldownData[] {
        return this.cache.map(c => c.toJSON());
    }
}
