import { RecipleClient } from '../structures/RecipleClient.js';
import { ReadonlyCollection } from '@discordjs/collection';
import { randomBytes } from 'node:crypto';
import { Collection } from 'discord.js';

export abstract class DataManager<T> {
    protected _cache: Collection<string, T> = new Collection();

    get cache() { return this._cache as ReadonlyCollection<string, T>; }

    constructor(readonly client: RecipleClient) {}

    public static generateId(): string {
        return randomBytes(8).toString('hex');
    }
}
