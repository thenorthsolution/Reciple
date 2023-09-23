import { Collection } from '@discordjs/collection';

/**
 * Resolve item from cache or fetch if not cached
 * @param id Item id
 * @param manager Item manager
 * @deprecated Just use fetch with force set to false
 */
export async function resolveFromCachedCollection<V>(id: string, manager: { cache: Collection<string, V>; fetch(key: string): Promise<V|null> }): Promise<V> {
    const data = manager.cache.get(id) ?? await manager.fetch(id);
    if (data === null) throw new Error(`Couldn't fetch (${id}) from manager`);
    return data;
}
