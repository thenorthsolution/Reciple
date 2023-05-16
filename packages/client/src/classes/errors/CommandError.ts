import { RestOrArray, normalizeArray } from 'discord.js';
import { BaseError, ErrorType } from './BaseError';
import kleur from 'kleur';

export const CommandErrorCodes = {
    UnknownCommand: () => `Unknown Reciple command type ${kleur.red('%0%')}`,
    CommandExecuteError: () => `An error occured while executing ${kleur.gray('%0%')} ${kleur.blue('%1%')}:\n  ${kleur.red('%2%')}`,
    CommandHaltError: () => `An error occured while executing halt for ${kleur.gray('%0%')} ${kleur.blue('%1%')}:\n  ${kleur.red('%2%')}`
}

export type CommandErrorCodes = typeof CommandErrorCodes;

export class CommandError extends BaseError<CommandErrorCodes> {
    readonly errorType: ErrorType.CommandError = ErrorType.CommandError;

    constructor(code: keyof CommandErrorCodes, ...placeholders: RestOrArray<string>) {
        super(code, CommandErrorCodes, ...normalizeArray(placeholders));
    }
}
