import { Awaitable, isJSONEncodable, JSONEncodable } from 'discord.js';
import { MessageCommandOptionValidators } from '../validators/MessageCommandOptionValidators';

export interface MessageCommandOptionBuilderData<T extends any = any> {
    name: string;
    description: string;
    /**
     * @default false
     */
    required?: boolean;
    validate?: (value: string) => Awaitable<boolean>;
    resolve_value?: (value: string) => Awaitable<T>;
}

export class MessageCommandOptionBuilder<T extends any = any> implements MessageCommandOptionBuilderData<T> {
    public name: string = '';
    public description: string = '';
    public required?: boolean = false;
    public validate?: (value: string) => Awaitable<boolean>;
    public resolve_value?: (value: string) => T;

    constructor(data?: Partial<MessageCommandOptionBuilderData>) {
        if (data?.name) this.setName(data.name);
        if (data?.description) this.setDescription(data.description);
        if (data?.required) this.setRequired(data.required);
        if (data?.validate) this.setValidate(data.validate);
        if (data?.resolve_value) this.setResolveValue(data.resolve_value);
    }

    public setName(name: string): this {
        MessageCommandOptionValidators.isValidName(name);
        this.name = name;
        return this;
    }

    public setDescription(description: string): this {
        MessageCommandOptionValidators.isValidDescription(description);
        this.description = description;
        return this;
    }

    public setRequired(required: boolean): this {
        MessageCommandOptionValidators.isValidRequired(required);
        this.required = required;
        return this;
    }

    public setValidate(validate: MessageCommandOptionBuilderData['validate']|null): this {
        MessageCommandOptionValidators.isValidValidate(validate);
        this.validate = validate ?? undefined;
        return this;
    }

    public setResolveValue(resolveValue: MessageCommandOptionBuilderData['resolve_value']|null): this {
        MessageCommandOptionValidators.isValidResolveValue(resolveValue);
        this.resolve_value = this.resolve_value ?? undefined;
        return this;
    }

    public toJSON(): MessageCommandOptionBuilderData {
        return {
            name: this.name,
            description: this.description,
            required: this.required,
            validate: this.validate,
            resolve_value: this.resolve_value
        };
    }

    public static from<T extends any = any>(data: MessageCommandOptionResolvable<T>): MessageCommandOptionBuilder<T> {
        return new MessageCommandOptionBuilder<T>(isJSONEncodable(data) ? data.toJSON() : data);
    }

    public static resolve<T extends any = any>(data: MessageCommandOptionResolvable<T>): MessageCommandOptionBuilder<T> {
        return data instanceof MessageCommandOptionBuilder ? data : this.from(data);
    }
}

export type MessageCommandOptionResolvable<T extends any = any> = MessageCommandOptionBuilderData<T>|JSONEncodable<MessageCommandOptionBuilderData<T>>;
