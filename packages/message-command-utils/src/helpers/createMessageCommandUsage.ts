import type { MessageCommandResolvable } from '@reciple/core';
import { isJSONEncodable } from 'discord.js';

export interface CreateMessageCommandUsageOptions {
    prefix?: string;
    flags?: {
        include?: boolean;
        useShort?: boolean;
        showValueType?: boolean;
        flagBrackets?: {
            required?: [string, string];
            optional?: [string, string];
        }
    };
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

    if (options?.flags?.include !== false && command.flags) for (const flagData of command.flags) {
        const flag = isJSONEncodable(flagData) ? flagData.toJSON() : flagData;
        const brackets = flag.required
            ? options?.flags?.flagBrackets?.required ?? ['<', '>']
            : options?.flags?.flagBrackets?.optional ?? ['[', ']'];

        let value = `${options?.flags?.useShort ? '-' + flag.shortcut : '--' + flag.name}`;

        if (options?.flags?.showValueType) value += `=${brackets[0]}${flag.value_type === 'string' ? 'string' : 'boolean'}${flag.multiple ? '...' : ''}${brackets[1]}`;

        usage += ` ${value}`;
    }

    return usage;
}
