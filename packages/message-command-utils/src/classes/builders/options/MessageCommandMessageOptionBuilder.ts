import type { MessageCommandOptionBuilderData, MessageCommandOptionBuilderResolveValueOptions, MessageCommandOptionManager } from '@reciple/core';
import { BaseMessageCommandOptionBuilder } from '../../structures/BaseMessageCommandOptionBuilder.js';
import { isValidSnowflake, MessageURLData } from '@reciple/utils';
import { Message } from 'discord.js';

export interface MessageCommandMessageOptionBuilderData extends MessageCommandOptionBuilderData<Message> {
    allow_outside_messages?: boolean;
    allow_bot_messages?: boolean;
}

export class MessageCommandMessageOptionBuilder extends BaseMessageCommandOptionBuilder<Message> implements MessageCommandMessageOptionBuilderData {
    public allow_outside_messages?: boolean = false;
    public allow_bot_messages?: boolean = true;

    constructor(data?: MessageCommandMessageOptionBuilderData) {
        super(data);
    }

    /**
     * Sets the value of allow_outside_messages to the provided boolean value.
     *
     * @param {boolean} allowOutsideMessages - The boolean value to set. If not provided, the value will be undefined.
     * @return {this} - The updated instance of the class.
     */
    public setAllowOutsideMessages(allowOutsideMessages?: boolean) {
        this.allow_outside_messages = allowOutsideMessages;
        return this;
    }

    /**
     * Sets the value of allow_bot_messages to the provided boolean value.
     *
     * @param {boolean} allowBotMessages - The boolean value to set. If not provided, the value will be undefined.
     * @return {this} - The updated instance of the class.
     */
    public setAllowBotMessages(allowBotMessages?: boolean) {
        this.allow_bot_messages = allowBotMessages;
        return this;
    }

    public resolve_value = async (options: MessageCommandOptionBuilderResolveValueOptions<Message<boolean>>): Promise<Message> => {
        const message = await MessageCommandMessageOptionBuilder.fetchMessageFromOptions(options);
        return message!;
    };

    public validate = async (options: MessageCommandOptionBuilderResolveValueOptions<Message<boolean>>): Promise<boolean|Error> => {
        const message = await MessageCommandMessageOptionBuilder.fetchMessageFromOptions(options);

        if (!message) return new Error('Invalid message');
        if (!this.allow_outside_messages && message.channel.id !== options.message.channel.id) return new Error('Message must be in the same channel');
        if (!this.allow_bot_messages && message.author.bot) return new Error('Message cannot be from a bot');

        return true;
    };

    /**
     * Fetches a message from the given options.
     *
     * @param {MessageCommandOptionBuilderResolveValueOptions} options - The options containing the value to fetch.
     * @return {Promise<Message|null>} A promise that resolves to the fetched message or null if not found.
     */
    protected static async fetchMessageFromOptions(options: MessageCommandOptionBuilderResolveValueOptions): Promise<Message|null> {
        let message: Message|null = null;

        if (MessageURLData.isValidMessageURL(options.value)) {
            message = await MessageURLData.fetch(options.value, options.client).then(m => m.message).catch(() => null);
        } else if (isValidSnowflake(options.value)) {
            const channel = options.message.channel;
            message = await channel.messages.fetch(options.value).catch(() => null);
        }

        return message;
    }

    public static async resolveOption(name: string, options: MessageCommandOptionManager, required?: false): Promise<Message|null>;
    public static async resolveOption(name: string, options: MessageCommandOptionManager, required?: true): Promise<Message>
    public static async resolveOption(name: string, options: MessageCommandOptionManager, required?: boolean): Promise<Message|null>;
    /**
     * Resolves a message option from the given options object.
     *
     * @param {string} name - The name of the option to resolve.
     * @param {MessageCommandOptionManager} options - The options object containing the option.
     * @param {boolean} [required] - Whether the option is required or not.
     * @return {Promise<Message|null>} - A promise that resolves to the resolved message or null if the option is not present and not required.
     */
    public static async resolveOption(name: string, options: MessageCommandOptionManager, required?: boolean): Promise<Message|null> {
        return super.resolveOption(name, options, required);
    }
}
