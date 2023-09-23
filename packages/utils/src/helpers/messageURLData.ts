import { BaseFetchOptions, Client } from 'discord.js';
import { MessageURLData } from '../classes/MessageURLData';

export function parseMessageURL(url: string|URL, client: Client): MessageURLData<boolean, false> {
    return MessageURLData.parse(url, client);
}

export function fetchMessageURL(url: string|URL, client: Client, fetchOptions?: BaseFetchOptions): Promise<MessageURLData<boolean, true>> {
    return MessageURLData.fetch(url, client, fetchOptions);
}
