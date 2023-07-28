export interface RecursiveDefault<T = unknown> {
    default?: T|RecursiveDefault<T>;
}

/**
 * Recursively get the default value of a value.
 * @param data The value to get the default value of.
 */
export function recursiveDefaults<T = unknown>(data: RecursiveDefault<T>|T): T|undefined {
    function isDefaults(object: any): object is RecursiveDefault<T> {
        return object?.default !== undefined;
    }

    if (!isDefaults(data)) return data;

    return recursiveDefaults(data.default!);
}
