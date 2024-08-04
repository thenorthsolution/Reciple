import type { ContextMenuCommandHaltTriggerData } from '../builders/ContextMenuCommandBuilder.js';
import type { MessageCommandHaltTriggerData } from '../builders/MessageCommandBuilder.js';
import type { SlashCommandHaltTriggerData } from '../builders/SlashCommandBuilder.js';
import { isJSONEncodable, type Awaitable, type JSONEncodable } from 'discord.js';
import type { AnyCommandHaltTriggerData } from '../../types/structures.js';
import { CommandType } from '../../types/constants.js';

export interface CommandHaltData {
    /**
     * The id of the command halt.
     * The id only accepts lowercase letters and cannot contain spaces or special characters.
     */
    id: string;
    /**
     * Whether the command halt is disabled.
     */
    disabled?: boolean;
    /**
     * The function that will be called when a context menu command halt is triggered.
     */
    contextMenuCommandHalt?(haltData: ContextMenuCommandHaltTriggerData): Awaitable<CommandHaltResultResolvable<CommandType.ContextMenuCommand>>;
    /**
     * The function that will be called when a message command halt is triggered.
     */
    messageCommandHalt?(haltData: MessageCommandHaltTriggerData): Awaitable<CommandHaltResultResolvable<CommandType.MessageCommand>>;
    /**
     * The function that will be called when a slash command halt is triggered.
     */
    slashCommandHalt?(haltData: SlashCommandHaltTriggerData): Awaitable<CommandHaltResultResolvable<CommandType.SlashCommand>>;
}

export type CommandHaltResultResolvable<T extends CommandType = CommandType, D extends any = any> = null|undefined|boolean|string|Omit<CommandHaltResultData<T, D>, 'halt'|'triggerData'>

export interface CommandHaltResultData<T extends CommandType = CommandType, D extends any = any> {
    /**
     * The command halt that was triggered.
     */
    halt: CommandHalt;
    /**
     * Whether the command halt was successful.
     */
    successful: boolean;
    /**
     * Custom string message about the result of the command halt.
     */
    message?: string;
    /**
     * Custom object result of the command halt.
     */
    data?: D;
    /**
     * The trigger data of the command halt.
     */
    triggerData: T extends CommandType.ContextMenuCommand
        ? ContextMenuCommandHaltTriggerData
        : T extends CommandType.MessageCommand
            ? MessageCommandHaltTriggerData
            : T extends CommandType.SlashCommand
                ? SlashCommandHaltTriggerData
                : AnyCommandHaltTriggerData;
}

export class CommandHalt implements CommandHaltData {
    public readonly id: string;
    public readonly contextMenuCommandHalt?: CommandHaltData['contextMenuCommandHalt'];
    public readonly messageCommandHalt?: CommandHaltData['messageCommandHalt'];
    public readonly slashCommandHalt?: CommandHaltData['slashCommandHalt'];

    public disabled: boolean;

    constructor(readonly data: CommandHaltData) {
        this.id = data.id;
        this.disabled = data.disabled ?? false;
        this.contextMenuCommandHalt = data.contextMenuCommandHalt ? (haltData => data.contextMenuCommandHalt!(haltData)) : undefined;
        this.messageCommandHalt = data.messageCommandHalt ? (haltData => data.messageCommandHalt!(haltData)) : undefined;
        this.slashCommandHalt = data.slashCommandHalt ? (haltData => data.slashCommandHalt!(haltData)) : undefined;
    }

    /**
     * Sets whether the command halt is disabled.
     * @param disabled Disable the command halt.
     */
    public setDisabled(disabled: boolean): this {
        this.disabled = disabled;
        return this;
    }

    public toJSON(): CommandHaltData {
        return { ...this };
    }

    public async execute<T extends AnyCommandHaltTriggerData = AnyCommandHaltTriggerData, D extends any = any>(trigger: T): Promise<CommandHaltResultData<T['commandType'], D>|null> {
        let data: CommandHaltResultResolvable<T['commandType'], D>;

        switch (trigger.commandType) {
            case CommandType.ContextMenuCommand:
                data = this.contextMenuCommandHalt ? await Promise.resolve(this.contextMenuCommandHalt(trigger)) : null;
                break;
            case CommandType.MessageCommand:
                data = this.messageCommandHalt ? await Promise.resolve(this.messageCommandHalt(trigger)) : null;
                break;
            case CommandType.SlashCommand:
                data = this.slashCommandHalt ? await Promise.resolve(this.slashCommandHalt(trigger)) : null;
                break;
        }

        data = typeof data === 'string'
            ? { successful: false, message: data }
            : typeof data === 'boolean'
                ? { successful: data }
                : data ?? null;

        if (data === null) return data;

        const resultData: CommandHaltResultData<T['commandType'], D> = {
            ...data,
            triggerData: trigger as any,
            halt: this
        };
        trigger.executeData.client.emit('recipleCommandHalt', resultData);
        return resultData;
    }

    public static from(data: CommandHaltResolvable): CommandHalt {
        return new CommandHalt((isJSONEncodable(data) ? data.toJSON() : data) as CommandHaltData);
    }

    public static resolve(data: CommandHaltResolvable): CommandHalt {
        return data instanceof CommandHalt ? data : CommandHalt.from(data);
    }
}

export type CommandHaltResolvable = JSONEncodable<CommandHaltData>|CommandHaltData;
