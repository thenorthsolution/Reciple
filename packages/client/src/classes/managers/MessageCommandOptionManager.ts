import { MessageCommandOptionValue } from '../builders/MessageCommandOptionBuilder';
import { RecipleError } from '../errors/RecipleError';
import { Collection } from 'discord.js';

export class MessageCommandOptionManager extends Collection<string, MessageCommandOptionValue> {
    /**
     * Get an option data
     * @param option Option name
     * @param full Returns the full option data if true
     */
    public getOption(option: string, full?: false): string|undefined;
    public getOption(option: string, full?: true): MessageCommandOptionValue;
    public getOption(option: string, full: boolean = false): string|undefined|MessageCommandOptionValue {
        const o = this.get(option);
        return full ? o : o?.value;
    }

    /**
     * Get option value
     * @param optionName Option name
     * @param required This option is required
     */
    public getValue(optionName: string, required?: false): string|null;
    public getValue(optionName: string, required?: true): string;
    public getValue(optionName: string, required: boolean = false): string|null {
        const option = this.get(optionName);
        if (required && !option?.value) throw new RecipleError(RecipleError.createCommandRequiredOptionNotFoundErrorOptions(optionName, option?.value));

        return option?.value || null;
    }
}
