import { MessageCommandOptionValue } from '../builders/MessageCommandOptionBuilder';
import { Collection } from 'discord.js';

export class MessageCommandOptionManager extends Collection<string, MessageCommandOptionValue> {
    public getOption(option: string, full: false): string|undefined;
    public getOption(option: string, full: true): MessageCommandOptionValue;
    public getOption(option: string, full: boolean = false): string|undefined|MessageCommandOptionValue {
        const o = this.get(option);
        return full ? o : o?.value;
    }
}
