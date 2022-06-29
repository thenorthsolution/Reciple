import { MessageCommandValidatedOption } from './MessageCommandBuilder';

export class MessageCommandOptions extends Array<MessageCommandValidatedOption> {
    constructor(options: MessageCommandValidatedOption[]) {
        super();
        this.push(...options);
    }

    public get(name: string, requied: true): MessageCommandValidatedOption;
    public get(name: string, requied?: boolean): MessageCommandValidatedOption|null;
    public get(name: string, required?: boolean) {
        const option = this.find(o => o.name == name);
        if (!option && required || option?.value == undefined && required) throw new TypeError(`Can't find option named ${name}`);

        return option ?? null;
    }

    public getValue(name: string, requied: true): string;
    public getValue(name: string, requied?: boolean): string|null;
    public getValue(name: string, requied?: boolean) {
        return this.get(name, requied)?.value ?? null;
    }
}
