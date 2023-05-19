import { RestOrArray, normalizeArray } from 'discord.js';
import { BaseError, ErrorType } from './BaseError';
import kleur from 'kleur';

// TODO: Remove this class

/**
 * @deprecated
 */
export const CommandErrorCodes = {
    /**
     * @deprecated
     */
    UnknownCommand: () => `Unknown Reciple command type ${kleur.red('%0%')}`,
    /**
     * @deprecated
     */
    CommandExecuteError: () => `An error occured while executing ${kleur.gray('%0%')} ${kleur.blue('%1%')}:\n  ${kleur.red('%2%')}`,
    /**
     * @deprecated
     */
    CommandHaltError: () => `An error occured while executing halt for ${kleur.gray('%0%')} ${kleur.blue('%1%')}:\n  ${kleur.red('%2%')}`
}

/**
 * @deprecated
 */
export type CommandErrorCodes = typeof CommandErrorCodes;

/**
 * @deprecated
 */
export class CommandError extends BaseError<CommandErrorCodes> {
    readonly errorType: ErrorType.CommandError = ErrorType.CommandError;

    constructor(code: keyof CommandErrorCodes, ...placeholders: RestOrArray<string>) {
        super(code, CommandErrorCodes, ...normalizeArray(placeholders));
    }
}
