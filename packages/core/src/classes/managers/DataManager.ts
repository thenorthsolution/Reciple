import { Collection } from 'discord.js';
import { RecipleClient } from '../structures/RecipleClient';
import { randomBytes } from 'crypto';

export abstract class DataManager<T> {
    readonly cache: Collection<string, T> = new Collection();
    constructor(readonly client: RecipleClient<true>) {}

    public static generateId(): string {
        return randomBytes(8).toString('hex');
    }
}
