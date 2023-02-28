import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

export class FileReader<T> {
    public data?: T;

    constructor (readonly fileLocation: string, readonly defaultContent: string = '') {}

    public read(): string {
        if (!existsSync(this.fileLocation)) return this.save();

        return readFileSync(this.fileLocation, 'utf-8');
    }

    public save(data?: string): string {
        mkdirSync(path.dirname(this.fileLocation), { recursive: true });
        writeFileSync(this.fileLocation, data ?? this.defaultContent);

        return this.read();
    }
}
