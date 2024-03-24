import { lstat, stat } from 'node:fs/promises';
import { PathLike } from 'node:fs';

/**
 * 
 * @param file Path to file or directory
 * @param statSymbolicLink If pathname is a symbolic link, then it will check to the linked file
 */
export async function existsAsync(file: PathLike, statSymbolicLink: boolean = false): Promise<boolean> {
    return (statSymbolicLink ? lstat(file) : stat(file)).then(() => true).catch(() => false);
}
