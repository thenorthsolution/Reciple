/**
 * Option builder for MessageCommandBuilder
 */
export class MessageCommandOptionBuilder {
    public name: string = '';
    public description: string = '';
    public required: boolean = false;
    public validator: (value: string) => boolean = () => true;

    /**
     * Set command option name 
     * @param name Option name
     */
    public setName(name: string): MessageCommandOptionBuilder {
        if (typeof name !== 'string' || !name.match(/^[\w-]{1,32}$/)) throw new TypeError('name must be a string and match the regex /^[\\w-]{1,32}$/.');
        this.name = name;
        return this;
    }

    /**
     * Set command option description
     * @param description Option description
     */
    public setDescription(description: string): MessageCommandOptionBuilder {
        if (!description || typeof description !== 'string') throw new TypeError('description must be a string.');
        this.description = description;
        return this;
    }

    /**
     * Set if this option is required 
     * @param required `true` if this option is required
     */
    public setRequired(required: boolean): MessageCommandOptionBuilder {
        if (typeof required !== 'boolean') throw new TypeError('required must be a boolean.');
        this.required = required;
        return this;
    }

    /**
     * Set your custom function to validate given value for this option
     * @param validator Custom function to validate value given for this option
     */
    public setValidator(validator: (value: string) => boolean): MessageCommandOptionBuilder {
        if (!validator || typeof validator !== 'function') throw new TypeError('validator must be a function.');
        this.validator = validator;
        return this;
    }
}
