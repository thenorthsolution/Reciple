export class MessageCommandOptionBuilder {
    public name: string = '';
    public description: string = '';
    public required: boolean = true;
    public validator: (value: string) => boolean = () => true;

    public setName(name: string): MessageCommandOptionBuilder {
        if (typeof name !== 'string' || !name.match(/^[\w-]{1,32}$/)) throw new TypeError('name must be a string and match the regex /^[\\w-]{1,32}$/.');
        this.name = name;
        return this;
    }

    public setDescription(description: string): MessageCommandOptionBuilder {
        if (!description || typeof description !== 'string') throw new TypeError('description must be a string.');
        this.description = description;
        return this;
    }

    public setRequired(required: boolean): MessageCommandOptionBuilder {
        if (typeof required !== 'boolean') throw new TypeError('required must be a boolean.');
        this.required = required;
        return this;
    }

    public setValidator(validator: (value: string) => boolean): MessageCommandOptionBuilder {
        if (!validator || typeof validator !== 'function') throw new TypeError('validator must be a function.');
        this.validator = validator;
        return this;
    }
}
