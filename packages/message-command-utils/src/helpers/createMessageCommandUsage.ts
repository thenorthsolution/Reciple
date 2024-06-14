import { MessageCommandResolvable } from '@reciple/core';
import { isJSONEncodable } from 'discord.js';

export interface CreateMessageCommandUsageOptions {
    prefix?: string;
    optionBrackets?: {
        required?: [string, string];
        optional?: [string, string];
    };
}

export function createMessageCommandUsage(data: MessageCommandResolvable, options?: CreateMessageCommandUsageOptions): string {
    const command = isJSONEncodable(data) ? data.toJSON() : data;

    let usage = `${options?.prefix ?? ''}${command.name}`;

    if (command.options) for (const optionData of command.options) {
        const option = isJSONEncodable(optionData) ? optionData.toJSON() : optionData;
        const brackets = option.required
            ? options?.optionBrackets?.required ?? ['<', '>']
            : options?.optionBrackets?.optional ?? ['[', ']']

        usage += ` ${brackets[0]}${option.name}${brackets[1]}`;
    }

    return usage;
}
