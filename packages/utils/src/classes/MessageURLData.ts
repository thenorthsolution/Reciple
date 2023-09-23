import { BaseFetchOptions, Client, DMChannel, Guild, GuildTextBasedChannel, If, Message, PartialDMChannel, PartialGroupDMChannel, TextBasedChannel } from 'discord.js';

export interface ParseMessageURLData {
    guildId: string|null;
    channelId: string;
    messageId: string;
}

export class MessageURLData<InGuild extends boolean = boolean, Fetched extends boolean = boolean> implements ParseMessageURLData {
    private _guildId: string|null = null;
    private _guild?: Guild|null;
    private _channel?: TextBasedChannel|null;
    private _message?: Message|null;

    readonly channelId: string;
    readonly messageId: string;

    get guildId() { return this._guildId as If<InGuild, string>; }
    get guild() { return this._guild as If<Fetched, If<InGuild, Guild, null>, undefined>; }
    get channel() { return this._channel as If<Fetched, If<InGuild, GuildTextBasedChannel, PartialGroupDMChannel|DMChannel|PartialDMChannel>, undefined>; }
    get message() { return this._message as If<Fetched, Message<InGuild>, undefined>; }

    constructor(data: ParseMessageURLData, public client?: Client) {
        this._guildId = data.guildId;
        this.channelId = data.channelId;
        this.messageId = data.messageId;
    }

    public async fetch(options?: BaseFetchOptions & { client?: Client }): Promise<MessageURLData<InGuild, true>> {
        this.client = options?.client ?? this.client;
        if (!this.client) throw new Error('Discord.js client is not defined');

        this._guild = this.guildId ? await this.client.guilds.fetch({ ...options, guild: this.guildId }) : null;
        this._channel = await this.client.channels.fetch(this.channelId, options) as TextBasedChannel|null;

        if (!this._channel) throw new Error(`Unable to fetch text based channel id: ${this.channelId}`);
        this._message = await this._channel.messages.fetch({ ...options, message: this.messageId });

        return this as MessageURLData<InGuild, true>;
    }

    public isFetched(): this is MessageURLData<InGuild, true> {
        return this._guild !== undefined && this._channel !== undefined && this._message !== undefined;
    }

    public isDMBased(): this is MessageURLData<false, Fetched> {
        return this.guildId === null;
    }

    public inGuild(): this is MessageURLData<true, Fetched> {
        return !this.isDMBased();
    }

    public toString(): string {
        return `https://discord.com/channels/${this.guildId ?? '@me'}/${this.channelId}/${this.messageId}`;
    }

    public toJSON(): ParseMessageURLData {
        return {
            guildId: this.guildId,
            channelId: this.channelId,
            messageId: this.messageId
        };
    }

    public static async fetch<InGuild extends boolean = boolean>(url: string|URL, client: Client, fetchOptions?: BaseFetchOptions): Promise<MessageURLData<InGuild, true>> {
        const data = this.parse<InGuild>(url);
        return data.fetch({ ...fetchOptions, client });
    }

    public static parse<InGuild extends boolean = boolean>(url: string|URL, client?: Client): MessageURLData<InGuild, false> {
        const structure = url instanceof URL ? url : new URL(url);
        const path = structure.pathname.split('/').filter(Boolean);

        if (path.length < 4) throw new Error('URL is not a valid discord message URL');

        const type = path.shift() as 'channels';
        if (type !== 'channels') throw new Error('URL is not a valid discord message URL');

        return new MessageURLData({
            guildId: path[0] === '@me' ? null : path[0],
            channelId: path[1],
            messageId: path[2]
        }, client);
    }

    public static isValidMessageURL(url: string|URL): boolean {
        const structure = url instanceof URL ? url : new URL(url);
        const path = structure.pathname.split('/').filter(Boolean);

        if (path.length < 4) return false;

        const type = path.shift() as 'channels';
        if (type !== 'channels') return false;

        return true;
    }
}
