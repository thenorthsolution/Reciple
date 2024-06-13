import { APIChannel, APIMessage, APIRole, APIUser, Channel, ChannelMention, ChannelResolvable, Client, FormattingPatterns, GuildMember, GuildResolvable, Role, RoleMention, RoleResolvable, User, UserMention, UserResolvable } from 'discord.js';
import { isValidSnowflake } from '../helpers/validators.js';

export interface MentionFetchOptions {
    client: Client;
    force?: boolean;
}

export class Mentions {
    private constructor() {}

    /**
     * Resolves the user ID from a user mention or API user object.
     * @param user The user mention or API user object.
     */
    public static getUserId(user: UserResolvable|APIUser|APIMessage|UserMention): string|null {
        const id = typeof user === 'string'
        ? user.match(FormattingPatterns.User)?.[1] ?? null
        : user && 'author' in user
            ? user.author.id
            : user.id;

        return !id && typeof user === 'string' && isValidSnowflake(user) ? user : id;
    }

    /**
     * Resolves the role ID from a role mention or API role object.
     * @param role The role mention or API role object.
     */
    public static getRoleId(role: RoleResolvable|APIRole|Exclude<RoleMention, '@everyone'>): string|null {
        const id = typeof role === 'string'
            ? role.match(FormattingPatterns.Role)?.[1] ?? null
            : role.id;
        return !id && typeof role === 'string' && isValidSnowflake(role) ? role : id;
    }

    /**
     * Resolves the channel ID from a channel mention or API channel object.
     * @param channel The channel mention or API channel object.
     */
    public static getChannelId(channel: ChannelResolvable|APIChannel|ChannelMention): string|null {
        const id = typeof channel === 'string'
            ? channel.match(FormattingPatterns.Channel)?.[1] ?? null
            : channel.id;
        return !id && typeof channel === 'string' && isValidSnowflake(channel) ? channel : id;
    }

    /**
     * Fetchs a user from the API using a user mention or API user object.
     * @param userResolvable The user mention or API user object.
     * @param options The options for fetching the user.
     */
    public static async fetchUser(userResolvable: UserResolvable|APIUser|APIMessage|UserMention, options: MentionFetchOptions): Promise<User> {
        const id = this.getUserId(userResolvable);
        if (!id) throw new Error(`Invalid user resolvable: ${id}`);

        return options.client.users.fetch(id, { force: options.force });
    }

    /**
     * Fetchs a member from the API using a user mention or API user object.
     * @param userResolvable The user mention or API user object.
     * @param options The options for fetching the member.
     */
    public static async fetchMember(userResolvable: UserResolvable|APIUser|APIMessage|UserMention, options: MentionFetchOptions & { guild: GuildResolvable; }): Promise<GuildMember> {
        const id = this.getUserId(userResolvable);
        if (!id) throw new Error(`Invalid user resolvable: ${id}`);

        const guild = await options.client.guilds.fetch({ guild: options.guild, force: options.force });
        return guild.members.fetch({ user: id, force: options.force });
    }

    /**
     * Fetchs a role from the API using a role mention or API role object.
     * @param role The role mention or API role object.
     * @param options The options for fetching the role.
     */
    public static async fetchRole(role: RoleResolvable|APIRole|Exclude<RoleMention, '@everyone'>, options: MentionFetchOptions & { guild: GuildResolvable; }): Promise<Role|null> {
        const id = this.getRoleId(role);
        if (!id) throw new Error(`Invalid role resolvable: ${id}`);

        const guild = await options.client.guilds.fetch({ guild: options.guild, force: options.force });
        return guild.roles.fetch(id, { force: options.force });
    }

    /**
     * Fetchs a channel from the API using a channel mention or API channel object.
     * @param channel The channel mention or API channel object.
     * @param options The options for fetching the channel.
     */
    public static async fetchChannel<C extends Channel = Channel>(channel: ChannelResolvable|APIChannel|ChannelMention, options: MentionFetchOptions): Promise<C|null> {
        const id = this.getChannelId(channel);
        if (!id) throw new Error(`Invalid channel resolvable: ${id}`);

        return options.client.channels.fetch(id, { force: options.force }) as Promise<C|null>;
    }
}
