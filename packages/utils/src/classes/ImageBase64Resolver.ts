import type { Base64Resolvable, BufferResolvable } from 'discord.js';
import { resolveFileData } from '../helpers/fileSystem.js';

export interface ResolvedFile {
    data: Buffer;
    contentType?: string;
}

/**
 * @deprecated Use `Base64Resolvabler`
 */
export class ImageBase64 {
    private constructor() {}

    /**
     * Resolves Base64 string URL
     * @param image Image resolvable
     */
    public async resolveImage(image: BufferResolvable|Base64Resolvable): Promise<string> {
        if (typeof image === 'string' && image.startsWith('data:')) return image;

        const file = await this.resolveFile(image);
        return this.toDataBase64(file.data);
    }

    /**
     * Converts buffer/image to string data base64
     * @param data Base64 resolvable
     */
    public toDataBase64(data: Base64Resolvable): string {
        if (Buffer.isBuffer(data)) return `data:image/jpg;base64,${data.toString('base64')}`;
        return data;
    }

    /**
     * Resolves image file/url/buffer
     * @param resource Source
     */
    public async resolveFile(resource: BufferResolvable): Promise<ResolvedFile> {
        return resolveFileData(resource);
    }
}
