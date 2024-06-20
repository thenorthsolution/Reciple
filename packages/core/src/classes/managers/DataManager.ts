import { ReadonlyCollection } from '@discordjs/collection';
import { Collection, SnowflakeGenerateOptions, SnowflakeUtil } from 'discord.js';

export abstract class DataManager<T> {
    protected _cache: Collection<string, T> = new Collection();

    get cache() { return this._cache as ReadonlyCollection<string, T>; }

    constructor() {}

    public static generateId(options?: SnowflakeGenerateOptions): string {
        return SnowflakeUtil.generate(options).toString();
    }
}
