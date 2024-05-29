import { MessageURLData } from '../classes/MessageURLData.js';
import { BaseFetchOptions, Client } from 'discord.js';

/**
 * Parse Discord message URL
 * @param url Message URL
 * @param client DiscordJs Client
 */
export function parseMessageURL(url: string|URL, client?: Client): MessageURLData<boolean, false> {
    return MessageURLData.parse(url, client);
}

/**
 * Fetch Discord message URL
 * @param url Message URL
 * @param client DiscordJs Client
 * @param fetchOptions Fetch options
 */
export function fetchMessageURL(url: string|URL, client: Client, fetchOptions?: BaseFetchOptions): Promise<MessageURLData<boolean, true>> {
    return MessageURLData.fetch(url, client, fetchOptions);
}
