import type { MessageCommandFlagBuilderData, MessageCommandFlagBuilderResolveValueOptions, MessageCommandFlagManager } from '@reciple/core';
import type { Message } from 'discord.js';
import { BaseMessageCommandFlagBuilder } from '../../structures/BaseMessageCommandFlagBuilder.js';
import { isValidSnowflake, MessageURLData } from '@reciple/utils';

export interface MessageCommandMessageFlagBuilderData extends MessageCommandFlagBuilderData<Message> {
    allow_outside_messages?: boolean;
    allow_bot_messages?: boolean;
}

export class MessageCommandMessageFlagBuilder extends BaseMessageCommandFlagBuilder<Message> implements MessageCommandMessageFlagBuilderData {
    public allow_outside_messages?: boolean = false;
    public allow_bot_messages?: boolean = true;

    constructor(data?: MessageCommandMessageFlagBuilderData) {
        super(data);
    }

    /**
     * Sets the value of allow_outside_messages to the provided boolean value.
     * @param {boolean} allowOutsideMessages - The boolean value to set. If not provided, the value will be undefined.
     */
    public setAllowOutsideMessages(allowOutsideMessages?: boolean) {
        this.allow_outside_messages = allowOutsideMessages;
        return this;
    }

    /**
     * Sets the value of allow_bot_messages to the provided boolean value.
     * @param {boolean} allowBotMessages - The boolean value to set. If not provided, the value will be undefined.
     */
    public setAllowBotMessages(allowBotMessages?: boolean) {
        this.allow_bot_messages = allowBotMessages;
        return this;
    }

    public resolve_value = async (options: MessageCommandFlagBuilderResolveValueOptions<Message>): Promise<Message[]> => {
        const messages = await MessageCommandMessageFlagBuilder.fetchMessageFromOptions(options);
        return messages;
    };

    public validate = async (options: MessageCommandFlagBuilderResolveValueOptions<Message>): Promise<boolean|Error> => {
        const messages = await MessageCommandMessageFlagBuilder.fetchMessageFromOptions(options);

        for (const message of messages) {
            if (!this.allow_outside_messages && message.channel.id !== options.message.channel.id) return new Error('Message must be in the same channel');
            if (!this.allow_bot_messages && message.author.bot) return new Error('Message cannot be from a bot');
        }

        return true;
    };

    public readonly value_type: 'string' = 'string';

    /**
     * Fetches a message from the given options.
     * @param {MessageCommandFlagBuilderResolveValueOptions<Message>} options - The options containing the value to fetch.
     */
    protected static async fetchMessageFromOptions(options: MessageCommandFlagBuilderResolveValueOptions<Message>): Promise<Message[]> {
        const messages: Message[] = [];

        for (const value of options.values.map(String)) {
            let message: Message|null = null;

            if (MessageURLData.isValidMessageURL(value)) {
                message = await MessageURLData.fetch(value, options.client).then(m => m.message).catch(() => null);
            } else if (isValidSnowflake(value)) {
                const channel = options.message.channel;
                message = await channel.messages.fetch(value).catch(() => null);
            }

            if (message) messages.push(message);
        }

        return messages;
    }

    /**
     * Resolves a message flag from the given flag manager.
     */
    public static async resolveFlag(name: string, options: MessageCommandFlagManager, required?: boolean): Promise<Message[]> {
        return super.resolveFlag(name, options, required);
    }
}
