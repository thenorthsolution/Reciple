export interface ParseMessageURLData {
    guildId: string|null;
    channelId: string;
    messageId: string;
}

export function parseMessageURL(url: string): ParseMessageURLData {
    const structure = new URL(url);
    const path = structure.pathname.split('/').filter(Boolean);

    if (path.length < 4) throw new Error('URL is not a valid discord message URL');

    const type = path.shift() as 'channels';
    if (type !== 'channels') throw new Error('URL is not a valid discord message URL');

    return {
        guildId: path[0] === '@me' ? null : path[0],
        channelId: path[1],
        messageId: path[2]
    }
}
