import { Collection, SnowflakeUtil, type SnowflakeGenerateOptions } from 'discord.js';
import type { ReadonlyCollection } from '@discordjs/collection';

export abstract class DataManager<T> {
    protected _cache: Collection<string, T> = new Collection();

    get cache() { return this._cache as ReadonlyCollection<string, T>; }

    constructor() {}

    public static generateId(options?: SnowflakeGenerateOptions): string {
        return SnowflakeUtil.generate(options).toString();
    }
}
