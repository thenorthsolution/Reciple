import { ContextMenuCommandExecuteData } from '../builders/ContextMenuCommandBuilder.js';
import { MessageCommandExecuteData } from '../builders/MessageCommandBuilder.js';
import { SlashCommandExecuteData } from '../builders/SlashCommandBuilder.js';
import { Awaitable, isJSONEncodable, JSONEncodable } from 'discord.js';
import { AnyCommandExecuteData } from '../../types/structures.js';
import { CommandType } from '../../types/constants.js';

export interface CommandPreconditionData {
    id: string;
    disabled?: boolean;
    contextMenuCommandExecute?: (execute: ContextMenuCommandExecuteData, precondition: CommandPrecondition) => Awaitable<CommandPreconditionResultResolvable<ContextMenuCommandExecuteData>>;
    messageCommandExecute?: (execute: MessageCommandExecuteData, precondition: CommandPrecondition) => Awaitable<CommandPreconditionResultResolvable<MessageCommandExecuteData>>;
    slashCommandExecute?: (execute: SlashCommandExecuteData, precondition: CommandPrecondition) => Awaitable<CommandPreconditionResultResolvable<SlashCommandExecuteData>>;
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

    constructor(data: CommandPreconditionData) {
        this.id = data.id;
        this.disabled = data.disabled ?? false;
        this.contextMenuCommandExecute = data.contextMenuCommandExecute;
        this.messageCommandExecute = data.messageCommandExecute;
        this.slashCommandExecute = data.slashCommandExecute;
    }

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
        return data instanceof CommandPrecondition ? data : this.from(data);
    }
}

export type CommandPreconditionResolvable = CommandPreconditionData|JSONEncodable<CommandPreconditionData>;
