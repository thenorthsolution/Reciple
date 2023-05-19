import stripAnsi from 'strip-ansi';

export interface RecipleErrorOptions {
    message: string;
    name?: string;
    cause?: unknown;
}

export class RecipleError extends Error {
    constructor(options: RecipleErrorOptions) {
        super(options.message, { ...options });

        this.name = options.name ?? this.name;
    }

    public toString() {
        return stripAnsi(super.toString());
    }
}
