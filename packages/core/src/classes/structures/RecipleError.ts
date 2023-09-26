import { kleur } from 'fallout-utility/strings';
import { stripVTControlCharacters } from 'util';

export interface RecipleErrorOptions {
    message: string;
    name?: string;
    cause?: unknown;
}

export class RecipleError extends Error {
    get cleanStack() { return this.stack && stripVTControlCharacters(this.stack); }

    constructor(options: RecipleErrorOptions|string) {
        options = typeof options === 'string' ? { message: options } : options;

        super(options.message, { ...options });

        if (options.name) this.name = kleur.bold().red(options.name);
    }

    public toString() {
        return stripVTControlCharacters(super.toString());
    }
}
