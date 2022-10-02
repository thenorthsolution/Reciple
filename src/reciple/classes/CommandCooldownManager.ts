import { Guild, normalizeArray, RestOrArray, TextBasedChannel, User } from 'discord.js';
import { CommandBuilderType } from '../types/builders.js';

/**
 * cooled-down user object interface
 */
export interface CooledDownUser {
    user: User;
    command: string;
    type: CommandBuilderType;
    guild?: Guild|null;
    channel?: TextBasedChannel;
    expireTime: number;
}

/**
 * cooled-down users manager
 */
export class CommandCooldownManager extends Array<CooledDownUser> {
    constructor(...data: RestOrArray<CooledDownUser>) {
        super(...normalizeArray(data));
    }

    /**
     * Alias for `CommandCooldownManager#push()`
     * @param options Cooled-down user data
     */
    public add(...options: CooledDownUser[]) { 
        return this.push(...options);
    }

    /**
     * Remove cooldown from specific user, channel or guild
     * @param options Remove cooldown data options
     * @param limit Remove cooldown data limit
     */
    public remove(options: Partial<CooledDownUser>, limit: number = 0) {
        if (!Object.keys(options).length) throw new TypeError('Provide atleast one option to remove cooldown data.');

        let i = 0;

        for (const index in this) {
            if (!CommandCooldownManager.checkOptions(options, this[index])) continue;
            if (options.expireTime && this[index].expireTime > Date.now()) continue;
            if (limit && i >= limit) continue;

            this.splice(Number(index));
            i++;
        }
    }

    /**
     * Check if the given user is cooled-down 
     * @param options Options to identify if user is on cooldown
     */
    public isCooledDown(options: Partial<Omit<CooledDownUser, 'expireTime'>>): boolean {
        const data = this.get(options);
        if (!data) return false;

        this.remove({ ...data, channel: undefined, guild: undefined, type: undefined, command: undefined });
        if (data.expireTime < Date.now()) return false;
        return true;
    }

    /**
     * Purge non cooled-down users from this array 
     * @param options Clean cooldown options
     */
    public clean(options?: Partial<Omit<CooledDownUser, 'expireTime'>>): void {
        for (const index in this) {
            if (options && !CommandCooldownManager.checkOptions(options, this[index])) return;
            if (this[index].expireTime > Date.now()) return;
            this.slice(Number(index));
        }
    }

    /**
     * Get someone's cooldown data 
     * @param options Get cooldown data options
     */
    public get(options: Partial<Omit<CooledDownUser, 'expireTime'>>): CooledDownUser|undefined {
        return this.find(data => CommandCooldownManager.checkOptions(options, data));
    }

    /**
     * Check if the options are valid
     * @param options Options to validated
     * @param data Cooled-down user data
     */
    public static checkOptions(options: Partial<Omit<CooledDownUser, 'expireTime'>>, data: CooledDownUser): boolean {
        if (options?.user !== undefined && options.user.id !== data.user.id) return false;
        if (options?.guild !== undefined && options.guild?.id !== data.guild?.id) return false;
        if (options?.channel !== undefined && options.channel.id !== data.channel?.id) return false;
        if (options?.command !== undefined && options.command !== data.command) return false;
        if (options?.type !== undefined && options.type !== data.type) return false;

        return true;
    }
}
