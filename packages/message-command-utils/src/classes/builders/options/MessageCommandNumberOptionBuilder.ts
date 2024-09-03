import type { MessageCommandOptionBuilderData, MessageCommandOptionBuilderResolveValueOptions, MessageCommandOptionManager } from '@reciple/core';
import { BaseMessageCommandOptionBuilder } from '../../structures/BaseMessageCommandOptionBuilder.js';

export interface MessageCommandNumberOptionBuilderData extends MessageCommandOptionBuilderData<number> {
    max_value?: number;
    min_value?: number;
}

export class MessageCommandNumberOptionBuilder extends BaseMessageCommandOptionBuilder<number> implements MessageCommandNumberOptionBuilderData {
    public max_value?: number;
    public min_value?: number;

    constructor(data?: MessageCommandNumberOptionBuilderData) {
        super(data);

        if (typeof data?.max_value === 'number') this.setMaxValue(data.max_value);
        if (typeof data?.min_value === 'number') this.setMinValue(data.min_value);
    }

    /**
     * Sets the maximum value for this option.
     * @param {number} [maxValue] - The maximum value to set. If not provided, the maximum value will be unset.
     */
    public setMaxValue(maxValue?: number): this {
        this.max_value = maxValue;
        return this;
    }

    /**
     * Sets the minimum value for this option.
     * @param {number} [minValue] - The minimum value to set. If not provided, the minimum value will be unset.
     */
    public setMinValue(minValue?: number): this {
        this.min_value = minValue;
        return this;
    }

    public readonly resolve_value = (options: MessageCommandOptionBuilderResolveValueOptions): number => {
        return Number(options.value);
    }

    public readonly validate = (options: MessageCommandOptionBuilderResolveValueOptions): boolean|Error => {
        const value = Number(options.value);
        if (!value || !Number.isFinite(value)) return new Error(`Value for option ${options.option.name} is not a number`);
        if (this.max_value && value > this.max_value) return new Error(`Value for option ${options.option.name} is greater than the maximum value of ${this.max_value}`);
        if (this.min_value && value < this.min_value) return new Error(`Value for option ${options.option.name} is less than the minimum value of ${this.min_value}`);

        return true;
    }

    /**
     * Asynchronously resolves a number option from the given manager.
     */
    public static async resolveOption(name: string, options: MessageCommandOptionManager, required?: false): Promise<number|null>;
    public static async resolveOption(name: string, options: MessageCommandOptionManager, required?: true): Promise<number>
    public static async resolveOption(name: string, options: MessageCommandOptionManager, required?: boolean): Promise<number|null>;
    public static async resolveOption(name: string, options: MessageCommandOptionManager, required?: boolean): Promise<number|null> {
        return super.resolveOption(name, options, required);
    }
}
