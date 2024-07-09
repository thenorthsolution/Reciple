import type { Base64Resolvable, BufferResolvable } from 'discord.js';
import { resolveFileData } from '../helpers/fileSystem.js';
import { fileTypeFromBuffer } from 'file-type';

export class Base64Resolvabler {
    private constructor() {}

    /**
     * Encodes the given data into a Base64URL string.
     *
     * @param {BufferResolvable|Base64Resolvable} data - The data to be encoded. It can be a BufferResolvable or a Base64Resolvable.
     * @param {Object} [options] - Optional parameters for encoding.
     * @param {string} [options.contentType] - The content type of the data.
     * @param {boolean} [options.url=true] - Whether to return a Base64URL string or the raw Base64 string.
     * @return {Promise<string>} A Promise that resolves to the Base64URL string of the encoded data.
     */
    public static async encode(data: BufferResolvable|Base64Resolvable, options?: { contentType?: string; url?: boolean; }): Promise<string> {
        if (this.isValidBase64URL(data)) return data;

        const file = await resolveFileData(data);

        if (options?.url !== false) {
            return this.bufferToBase64URL(file.data, options?.contentType ?? file.contentType);
        }

        return file.data.toString('base64');
    }

    /**
     * Decodes the given data from a Base64URL string to a Buffer.
     *
     * @param {string} data - The Base64URL string to be decoded.
     * @return {Promise<Buffer>} A Promise that resolves to the decoded Buffer.
     */
    public static async decode(data: string): Promise<Buffer> {
        if (this.isValidBase64URL(data)) return Buffer.from(data.split(',')[1], 'base64');
        return Buffer.from(data, 'base64');
    }

    /**
     * Converts a buffer to a Base64URL string.
     *
     * @param {Base64Resolvable} data - The buffer to be converted.
     * @param {string} [contentType] - The content type of the data.
     * @return {Promise<string>} A Promise that resolves to the Base64URL string of the encoded data.
     */
    public static async bufferToBase64URL(data: Base64Resolvable, contentType?: string): Promise<string> {
        if (!Buffer.isBuffer(data)) return data;

        contentType ??= (await fileTypeFromBuffer(data))?.mime ?? 'text/plain';

        return `data:${contentType};base64,${data.toString('base64')}`;
    }

    /**
     * Validates if the input data is a valid Base64URL string format.
     *
     * @param {unknown} data - The data to be validated.
     * @return {boolean} Returns true if the data is in the correct Base64URL string format, false otherwise.
     */
    public static isValidBase64URL(data: unknown): data is `data:${string};base64,${string}` {
        return typeof data === 'string' && data.startsWith('data:') && data.includes(';base64,');
    }
}
