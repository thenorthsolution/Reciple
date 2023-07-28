import { RestOrArray, normalizeArray } from 'fallout-utility';

/**
 * Replace index placeholders in a string.
 * @param message The string that contains the placeholders.
 * @param placeholders An array of strings that represent the placeholders.
 */
export function replacePlaceholders(message: string, ...placeholders: RestOrArray<string>) {
    placeholders = normalizeArray(placeholders);

    for (const index in placeholders) {
        message = message.replaceAll(`%${index}%`, placeholders[index]);
    }

    return message;
}
