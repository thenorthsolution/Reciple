import { lstat, readFile, stat } from 'node:fs/promises';
import type { PathLike } from 'node:fs';
import type { BufferResolvable, ResolvedFile } from 'discord.js';
import path from 'node:path';
import { fileTypeFromBuffer } from 'file-type';

/**
 * 
 * @param file Path to file or directory
 * @param statSymbolicLink If pathname is a symbolic link, then it will check to the linked file
 */
export async function existsAsync(file: PathLike, statSymbolicLink: boolean = false): Promise<boolean> {
    return (statSymbolicLink ? lstat(file) : stat(file)).then(() => true).catch(() => false);
}

export async function resolveFileData(resource: BufferResolvable): Promise<ResolvedFile> {
    if (Buffer.isBuffer(resource)) return { data: resource };

    if (typeof resource === 'string') {
        if (/^https?:\/\//.test(resource)) {
            const res = await fetch(resource);
            return {
                data: Buffer.from(await res.arrayBuffer()),
                contentType: res.headers.get('content-type') ?? undefined
            };
        }

        const file = path.resolve(resource);
        const stats = await stat(file);

        if (!stats.isFile()) throw new Error('File not found', { cause: file });
        const data = await readFile(file);

        return {
            data,
            contentType: (await fileTypeFromBuffer(data))?.mime
        };
    }

    throw new Error('Unknown file');
}
