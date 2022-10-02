import { MessageCommandValidatedOption } from './builders/MessageCommandBuilder.js';
import { normalizeArray, RestOrArray } from 'discord.js';

/**
 * Validated message options manager
 */
export class MessageCommandOptionManager extends Array<MessageCommandValidatedOption> {
    constructor(...data: RestOrArray<MessageCommandValidatedOption>) {
        super(...normalizeArray(data));
    }

    /**
     * Get the option info 
     * @param name Option name
     * @param requied Is the option required
     */
    public get(name: string, requied: true): MessageCommandValidatedOption;
    public get(name: string, requied?: boolean): MessageCommandValidatedOption|null;
    public get(name: string, required?: boolean) {
        const option = this.find(o => o.name == name);
        if (!option?.value == undefined && required) throw new TypeError(`Can't find option named ${name}`);

        return option ?? null;
    }

    /**
     * Get the option value 
     * @param name Option name
     * @param requied Is the option required
     */
    public getValue(name: string, requied: true): string;
    public getValue(name: string, requied?: boolean): string|null;
    public getValue(name: string, requied?: boolean) {
        const option = this.get(name, requied);
        if (!option?.value && requied) throw new TypeError(`Value of option named ${name} is undefined`);

        return option?.value ?? null;
    }
}
