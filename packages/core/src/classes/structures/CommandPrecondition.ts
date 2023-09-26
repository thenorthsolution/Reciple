import { Awaitable, isJSONEncodable, JSONEncodable } from 'discord.js';
import { ContextMenuCommandExecuteData } from '../builders/ContextMenuCommandBuilder';
import { AnyCommandExecuteData } from '../../types/structures';
import { CommandType } from '../../types/constants';
import { MessageCommandExecuteData } from '../builders/MessageCommandBuilder';
import { SlashCommandExecuteData } from '../builders/SlashCommandBuilder';

export interface CommandPreconditionData {
    id: string;
    disabled?: boolean;
    contextMenuCommandExecute: (execute: ContextMenuCommandExecuteData) => Awaitable<boolean|string|Omit<CommandPreconditionExecuteData, 'executeData'>>;
    messageCommandExecute: (execute: MessageCommandExecuteData) => Awaitable<boolean|string|Omit<CommandPreconditionExecuteData, 'executeData'>>;
    slashCommandExecute: (execute: SlashCommandExecuteData) => Awaitable<boolean|string|Omit<CommandPreconditionExecuteData, 'executeData'>>;
}

export interface CommandPreconditionExecuteData<T extends AnyCommandExecuteData = AnyCommandExecuteData> {
    successful: boolean;
    message?: string;
    executeData: T;
}

export class CommandPrecondition implements CommandPreconditionData {
    public readonly id: string;
    public readonly contextMenuCommandExecute: CommandPreconditionData['contextMenuCommandExecute'];
    public readonly messageCommandExecute: CommandPreconditionData['messageCommandExecute'];
    public readonly slashCommandExecute: CommandPreconditionData['slashCommandExecute'];

    public disabled: boolean = false;

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

    public async execute<T extends AnyCommandExecuteData = AnyCommandExecuteData>(execute: T): Promise<CommandPreconditionExecuteData<T>> {
        let data: string|boolean|Omit<CommandPreconditionExecuteData, 'executeData'>;

        switch (execute.type) {
            case CommandType.ContextMenuCommand:
                data = await Promise.resolve(this.contextMenuCommandExecute(execute));
                break;
            case CommandType.MessageCommand:
                data = await Promise.resolve(this.messageCommandExecute(execute));
                break;
            case CommandType.SlashCommand:
                data = await Promise.resolve(this.slashCommandExecute(execute));
                break;
        }

        data = typeof data === 'string'
            ? { successful: false, message: data }
            : typeof data === 'boolean'
                ? { successful: data }
                : data;

        const preconditionData: CommandPreconditionExecuteData<T> = { ...data, executeData: execute };
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
