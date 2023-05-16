import { replacePlaceholders } from '../../utils/functions';
import { RestOrArray, normalizeArray } from 'discord.js';
import { CommandError } from './CommandError';
import { ModuleError } from './ModuleError';
import stripAnsi from 'strip-ansi';
import kleur from 'kleur';

export interface BaseErrorCodes {
    [code: string|number]: (() => string)|string;
}

export enum ErrorType {
    ClientError = 1,
    ModuleError,
    CommandError,
}

export abstract class BaseError<ErrorCodes extends BaseErrorCodes = BaseErrorCodes> extends Error {
    abstract readonly errorType: ErrorType;

    constructor(readonly code: keyof BaseErrorCodes, errorCodes: ErrorCodes, ...placeholders: RestOrArray<string>) {
        const message = errorCodes[code];

        super(`${kleur.red().bold(code)} ${replacePlaceholders(typeof message === 'function' ? message() : message, ...normalizeArray(placeholders))}`);
    }

    public isCommandError(): this is CommandError {
        return this.errorType === ErrorType.CommandError;
    }

    public isModuleError(): this is ModuleError {
        return this.errorType === ErrorType.ModuleError;
    }

    public toString(): string {
        return stripAnsi(super.toString());
    }
}
