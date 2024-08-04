import type { ContextMenuCommandExecuteData } from '../builders/ContextMenuCommandBuilder.js';
import type { MessageCommandExecuteData } from '../builders/MessageCommandBuilder.js';
import type { SlashCommandExecuteData } from '../builders/SlashCommandBuilder.js';
import { isJSONEncodable, type Awaitable, type JSONEncodable } from 'discord.js';
import type { AnyCommandExecuteData } from '../../types/structures.js';
import { CommandType } from '../../types/constants.js';

export interface CommandPreconditionData {
    /**
     * The id of the precondition.
     * The id only accepts lowercase letters and cannot contain spaces or special characters.
     */
    id: string;
    /**
     * Whether the precondition is disabled.
     */
    disabled?: boolean;
    /**
     * The execute function for context menu commands.
     * @param execute Execute data for the command.
     * @param precondition The precondition that is being executed.
     */
    contextMenuCommandExecute?(execute: ContextMenuCommandExecuteData, precondition: CommandPrecondition): Awaitable<CommandPreconditionResultResolvable<ContextMenuCommandExecuteData>>;
    /**
     * The execute function for message commands.
     * @param execute Execute data for the command.
     * @param precondition The precondition that is being executed.
     */
    messageCommandExecute?(execute: MessageCommandExecuteData, precondition: CommandPrecondition): Awaitable<CommandPreconditionResultResolvable<MessageCommandExecuteData>>;
    /**
     * The execute function for slash commands.
     * @param execute Execute data for the command.
     * @param precondition The precondition that is being executed.
     */
    slashCommandExecute?(execute: SlashCommandExecuteData, precondition: CommandPrecondition): Awaitable<CommandPreconditionResultResolvable<SlashCommandExecuteData>>;
}

export type CommandPreconditionResultResolvable<T extends AnyCommandExecuteData = AnyCommandExecuteData, D extends any = any> = boolean|string|Omit<CommandPreconditionResultData<T, D>, 'executeData'|'precondition'>;

export interface CommandPreconditionResultData<T extends AnyCommandExecuteData = AnyCommandExecuteData, D extends any = any> {
    precondition: CommandPrecondition;
    successful: boolean;
    message?: string;
    data?: D;
    executeData: T;
}

export class CommandPrecondition implements CommandPreconditionData {
    public readonly id: string;
    public readonly contextMenuCommandExecute?: CommandPreconditionData['contextMenuCommandExecute'];
    public readonly messageCommandExecute?: CommandPreconditionData['messageCommandExecute'];
    public readonly slashCommandExecute?: CommandPreconditionData['slashCommandExecute'];

    public disabled: boolean;

    constructor(readonly data: CommandPreconditionData) {
        this.id = data.id;
        this.disabled = data.disabled ?? false;
        this.contextMenuCommandExecute = data.contextMenuCommandExecute ? ((preconditionData, precondition) => data.contextMenuCommandExecute!(preconditionData, precondition)) : undefined;
        this.messageCommandExecute = data.messageCommandExecute ? ((preconditionData, precondition) => data.messageCommandExecute!(preconditionData, precondition)) : undefined;
        this.slashCommandExecute = data.slashCommandExecute ? ((preconditionData, precondition) => data.slashCommandExecute!(preconditionData, precondition)) : undefined;
    }

    /**
     * Sets the disabled state of the precondition.
     * @param disabled Disabled state of the precondition.
     */
    public setDisabled(disabled: boolean): this {
        this.disabled = disabled;
        return this;
    }

    public async execute<T extends AnyCommandExecuteData = AnyCommandExecuteData, D extends any = any>(execute: T): Promise<CommandPreconditionResultData<T, D>> {
        let data: CommandPreconditionResultResolvable<T, D>;

        switch (execute.type) {
            case CommandType.ContextMenuCommand:
                data = this.contextMenuCommandExecute ? await Promise.resolve(this.contextMenuCommandExecute(execute, this)) : true;
                break;
            case CommandType.MessageCommand:
                data = this.messageCommandExecute ? await Promise.resolve(this.messageCommandExecute(execute, this)) : true;
                break;
            case CommandType.SlashCommand:
                data = this.slashCommandExecute ? await Promise.resolve(this.slashCommandExecute(execute, this)) : true;
                break;
        }

        data = typeof data === 'string'
            ? { successful: false, message: data }
            : typeof data === 'boolean'
                ? { successful: data }
                : data;

        const preconditionData: CommandPreconditionResultData<T, D> = { ...data, precondition: this, executeData: execute };
        execute.client.emit('recipleCommandPrecondition', preconditionData);
        return preconditionData;
    }

    public toJSON(): CommandPreconditionData {
        return {
            id: this.id,
            disabled: this.disabled,
            contextMenuCommandExecute: this.contextMenuCommandExecute,
            messageCommandExecute: this.messageCommandExecute,
            slashCommandExecute: this.slashCommandExecute
        };
    }

    public static from(data: CommandPreconditionResolvable): CommandPrecondition {
        return new CommandPrecondition(isJSONEncodable(data) ? data.toJSON() : data);
    }

    public static resolve(data: CommandPreconditionResolvable): CommandPrecondition {
        return data instanceof CommandPrecondition ? data : CommandPrecondition.from(data);
    }
}

export type CommandPreconditionResolvable = CommandPreconditionData|JSONEncodable<CommandPreconditionData>;
