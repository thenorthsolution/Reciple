import { Message } from 'discord.js';
import { BaseMessageCommandOptionBuilder } from '../structures/BaseMessageCommandOptionBuilder.js';
import { MessageCommandOptionBuilderData, MessageCommandOptionBuilderResolveValueOptions, MessageCommandOptionManager } from '@reciple/core';
import { isValidSnowflake, MessageURLData } from '@reciple/utils';

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

    public setAllowOutsideMessages(allowOutsideMessages?: boolean) {
        this.allow_outside_messages = allowOutsideMessages;
        return this;
    }

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
    public static async resolveOption(name: string, options: MessageCommandOptionManager, required?: boolean): Promise<Message|null> {
        return super.resolveOption(name, options, required);
    }
}
