import stripAnsi from 'strip-ansi';
import kleur from 'kleur';

export interface RecipleErrorOptions {
    message: string;
    name?: string;
    cause?: unknown;
}

export class RecipleError extends Error {
    get cleanStack() { return this.stack && stripAnsi(this.stack); }

    constructor(options: RecipleErrorOptions|string) {
        options = typeof options === 'string' ? { message: options } : options;

        super(options.message, { ...options });

        if (options.name) this.name = kleur.bold().red(options.name);
    }

    public toString() {
        return stripAnsi(super.toString());
    }
}
