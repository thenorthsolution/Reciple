import type { Client, GuildMember, GuildResolvable, User, UserResolvable } from 'discord.js';
import { FormattingPatterns, APIUser, APIMessage } from 'discord-api-types/v10';
import { isValidSnowflake } from './validators.js';

export interface FetchMentionOrIdOptions {
    client: Client;
    user: UserResolvable|APIUser|APIMessage|`<@${string}>`;
    guild?: GuildResolvable;
    force?: boolean;
}

/**
 * Get user id from mention or user object
 * @param user User resolvable
 * @deprecated Use `Mentions#getUserId` instead.
 */
export function getMentionId(user: UserResolvable|APIUser|APIMessage|`<@${string}>`): string|null {
    const id = typeof user === 'string'
        ? user.match(FormattingPatterns.User)?.[1] ?? null
        : user && 'author' in user
            ? user.author.id
            : user.id;

    return !id && typeof user === 'string' && isValidSnowflake(user) ? user : id;
}

/**
 * Fetch user object of a user id or object
 * @deprecated Use `Mentions#fetchUser` instead.
 */
export async function fetchMentionOrId(options: Omit<FetchMentionOrIdOptions, 'guild'>): Promise<User>;
export async function fetchMentionOrId(options: FetchMentionOrIdOptions): Promise<GuildMember>;
export async function fetchMentionOrId(options: FetchMentionOrIdOptions): Promise<User|GuildMember> {
    const id = getMentionId(options.user);
    if (!id) throw new Error(`Invalid user resolvable ${id}`);

    if (!options.guild) return options.client.users.fetch(id, { force: options.force });

    const guild = await options.client.guilds.fetch({ guild: options.guild, force: options.force });
    return guild.members.fetch({ user: id, force: options.force });
}
