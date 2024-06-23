import type { Snowflake } from 'discord-api-types/globals';

/**
 * Check if string is a valid Discord snowflake
 * @param snowflake a value that could be a snowflake
 */
export function isValidSnowflake(snowflake: unknown): snowflake is Snowflake {
    if (typeof snowflake !== 'string') return false;

    try {
        BigInt(snowflake);
        return true;
    } catch (err) {
        return false;
    }
}
