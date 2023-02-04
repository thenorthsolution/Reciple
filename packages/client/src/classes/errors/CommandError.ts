import { RestOrArray, normalizeArray } from 'discord.js';
import { BaseError, ErrorType } from './BaseError';

export const CommandErrorCodes = {
    'UnknownCommand': 'Unknown Reciple command',
    'CommandExecuteError': 'An error occured while executing [%0%: %1%]: %2%',
    'CommandHaltError': 'An error occured while executing halt for [%0%: %1%]: %2%'
}

export type CommandErrorCodes = typeof CommandErrorCodes;

export class CommandError extends BaseError<CommandErrorCodes> {
    readonly type: ErrorType.CommandError = ErrorType.CommandError;

    constructor(code: keyof CommandErrorCodes, ...placeholders: RestOrArray<string>) {
        super(code, CommandErrorCodes, ...normalizeArray(placeholders));
    }
}
