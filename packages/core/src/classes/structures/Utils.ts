import { ContextMenuCommandBuilder, ContextMenuCommandResolvable } from '../builders/ContextMenuCommandBuilder';
import { MessageCommandBuilder, MessageCommandResolvable } from '../builders/MessageCommandBuilder';
import { SlashCommandBuilder, SlashCommandResolvable } from '../builders/SlashCommandBuilder';
import { AnyCommandBuilder, AnyCommandResolvable } from '../../types/structures';
import { CommandType } from '../../types/constants';
import { isJSONEncodable } from 'discord.js';

export class Utils {
    private constructor() {}

    public static getCommandTypeName(commandType: CommandType): string {
        switch (commandType) {
            case CommandType.ContextMenuCommand:
                return 'Context Menu Command';
            case CommandType.MessageCommand:
                return 'Message Command';
            case CommandType.SlashCommand:
                return 'Slash Command';
        }
    }

    public static resolveCommandBuilder(data: ContextMenuCommandResolvable, createNewInstance?: boolean): ContextMenuCommandBuilder;
    public static resolveCommandBuilder(data: MessageCommandResolvable, createNewInstance?: boolean): MessageCommandBuilder;
    public static resolveCommandBuilder(data: SlashCommandResolvable, createNewInstance?: boolean): SlashCommandBuilder;
    public static resolveCommandBuilder(data: AnyCommandResolvable, createNewInstance?: boolean): AnyCommandBuilder;
    public static resolveCommandBuilder(data: AnyCommandResolvable, createNewInstance: boolean = false): AnyCommandBuilder {
        if (!createNewInstance) {
            if (data instanceof ContextMenuCommandBuilder) return data;
            if (data instanceof MessageCommandBuilder) return data;
            if (data instanceof SlashCommandBuilder) return data;
        }

        if (isJSONEncodable(data)) return this.resolveCommandBuilder(data.toJSON(), createNewInstance);

        switch (data.command_type) {
            case CommandType.ContextMenuCommand:
                return ContextMenuCommandBuilder.from(data);
            case CommandType.MessageCommand:
                return MessageCommandBuilder.from(data);
            case CommandType.SlashCommand:
                return SlashCommandBuilder.from(data);
        }
    }
}
