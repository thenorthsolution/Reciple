import { Base64Resolvable, BufferResolvable, DiscordjsError, DiscordjsErrorCodes, DiscordjsTypeError, ResolvedFile } from 'discord.js';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

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
        if (Buffer.isBuffer(resource)) return { data: resource };

        if (typeof resource === 'string') {
            if (/^https?:\/\//.test(resource)) {
                const res = await fetch(resource);
                return { data: Buffer.from(await res.arrayBuffer()), contentType: res.headers.get('content-type') ?? undefined };
            }

            const file = path.resolve(resource);
            const stats = await stat(file);

            if (!stats.isFile()) throw new DiscordjsError(DiscordjsErrorCodes.FileNotFound, file);
            return { data: await readFile(file) };
        }

        throw new DiscordjsTypeError(DiscordjsErrorCodes.ReqResourceType);
    }
}
