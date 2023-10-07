import { Awaitable, isJSONEncodable, JSONEncodable } from 'discord.js';
import { ContextMenuCommandExecuteData } from '../builders/ContextMenuCommandBuilder';
import { AnyCommandExecuteData } from '../../types/structures';
import { CommandType } from '../../types/constants';
import { MessageCommandExecuteData } from '../builders/MessageCommandBuilder';
import { SlashCommandExecuteData } from '../builders/SlashCommandBuilder';

export interface CommandPreconditionData {
    id: string;
    disabled?: boolean;
    contextMenuCommandExecute: (execute: ContextMenuCommandExecuteData, precondition: CommandPrecondition) => Awaitable<boolean|string|Omit<CommandPreconditionTriggerData, 'executeData'>>;
    messageCommandExecute: (execute: MessageCommandExecuteData, precondition: CommandPrecondition) => Awaitable<boolean|string|Omit<CommandPreconditionTriggerData, 'executeData'>>;
    slashCommandExecute: (execute: SlashCommandExecuteData, precondition: CommandPrecondition) => Awaitable<boolean|string|Omit<CommandPreconditionTriggerData, 'executeData'>>;
}

export interface CommandPreconditionTriggerData<T extends AnyCommandExecuteData = AnyCommandExecuteData, D extends any = any> {
    precondition: CommandPrecondition;
    successful: boolean;
    message?: string;
    data?: D;
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

    public async execute<T extends AnyCommandExecuteData = AnyCommandExecuteData, D extends any = any>(execute: T): Promise<CommandPreconditionTriggerData<T, D>> {
        let data: string|boolean|Omit<CommandPreconditionTriggerData, 'executeData'|'precondition'>;

        switch (execute.type) {
            case CommandType.ContextMenuCommand:
                data = await Promise.resolve(this.contextMenuCommandExecute(execute, this));
                break;
            case CommandType.MessageCommand:
                data = await Promise.resolve(this.messageCommandExecute(execute, this));
                break;
            case CommandType.SlashCommand:
                data = await Promise.resolve(this.slashCommandExecute(execute, this));
                break;
        }

        data = typeof data === 'string'
            ? { successful: false, message: data }
            : typeof data === 'boolean'
                ? { successful: data }
                : data;

        const preconditionData: CommandPreconditionTriggerData<T, D> = { ...data, precondition: this, executeData: execute };
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


// TODO: Cooldown precondition
// TODO: Bot Execute permissions precondition
// TODO: User Execute permissions precondition
