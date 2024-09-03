import type { MessageCommandFlagBuilderData, MessageCommandFlagBuilderResolveValueOptions, MessageCommandFlagManager } from '@reciple/core';
import { BaseMessageCommandFlagBuilder } from '../../structures/BaseMessageCommandFlagBuilder.js';

export interface MessageCommandNumberFlagBuilderData extends MessageCommandFlagBuilderData<number> {
    max_value?: number;
    min_value?: number;
}

export class MessageCommandNumberFlagBuilder extends BaseMessageCommandFlagBuilder<number> implements MessageCommandNumberFlagBuilderData {
    public max_value?: number;
    public min_value?: number;

    constructor(data?: MessageCommandNumberFlagBuilderData) {
        super(data);

        if (typeof data?.max_value === 'number') this.setMaxValue(data.max_value);
        if (typeof data?.min_value === 'number') this.setMinValue(data.min_value);
    }

    public setMaxValue(maxValue?: number): this {
        this.max_value = maxValue;
        return this;
    }

    public setMinValue(minValue?: number): this {
        this.min_value = minValue;
        return this;
    }

    public readonly resolve_value = (options: MessageCommandFlagBuilderResolveValueOptions<number>): number[] => {
        return options.values.map(Number);
    }

    public readonly validate = (options: MessageCommandFlagBuilderResolveValueOptions<number>): boolean|Error => {
        for (const value of options.values.map(Number)) {
            if (!value || !Number.isFinite(value)) return new Error(`A value for flag ${options.flag.name} is not a number`);
            if (this.max_value && value > this.max_value) return new Error(`A value for flag ${options.flag.name} is greater than the maximum value of ${this.max_value}`);
            if (this.min_value && value < this.min_value) return new Error(`A value for flag ${options.flag.name} is less than the minimum value of ${this.min_value}`);
        }

        return true;
    }

    public readonly value_type: 'string' | 'boolean' = 'string';

    public static async resolveOption(name: string, options: MessageCommandFlagManager, required?: boolean): Promise<number[]> {
        return super.resolveOption(name, options, required);
    }
}
