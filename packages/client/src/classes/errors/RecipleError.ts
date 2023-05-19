import stripAnsi from 'strip-ansi';
import kleur from 'kleur';

export interface RecipleErrorOptions {
    message: string;
    name?: string;
    cause?: unknown;
}

export class RecipleError extends Error {
    constructor(options: RecipleErrorOptions) {
        super(options.message, { ...options });

        if (options.name) this.name = kleur.bold().red(options.name);
    }

    public toString() {
        return stripAnsi(super.toString());
    }
}
