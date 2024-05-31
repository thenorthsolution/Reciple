import { isJSONEncodable, JSONEncodable } from 'discord.js';
import { CommandType } from '../../types/constants.js';
import { AnyCommandHaltFunction, AnyCommandHaltTriggerData } from '../../types/structures.js';
import { ContextMenuCommandHaltFunction, ContextMenuCommandHaltTriggerData } from '../builders/ContextMenuCommandBuilder.js';
import { MessageCommandHaltFunction, MessageCommandHaltTriggerData } from '../builders/MessageCommandBuilder.js';
import { SlashCommandHaltFunction, SlashCommandHaltTriggerData } from '../builders/SlashCommandBuilder.js';

export interface CommandHaltData<T extends CommandType = CommandType> {
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
     * The command types that the command halt will be used for.
     */
    commandTypes: T[];
    /**
     * The function that will be called when the command halt is triggered.
     */
    halt: T extends CommandType.ContextMenuCommand
        ? ContextMenuCommandHaltFunction
        : T extends CommandType.MessageCommand
            ? MessageCommandHaltFunction
            : T extends CommandType.SlashCommand
                ? SlashCommandHaltFunction
                : AnyCommandHaltFunction;
}

export type CommandHaltResultResolvable<T extends CommandType = CommandType, D extends any = any> = null|undefined|boolean|string|Omit<CommandHaltResultData<T, D>, 'halt'|'triggerData'>

export interface CommandHaltResultData<T extends CommandType = CommandType, D extends any = any> {
    /**
     * The command halt that was triggered.
     */
    halt: CommandHalt<T>;
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

export class CommandHalt<T extends CommandType = CommandType> implements CommandHaltData<T> {
    public readonly id: string;
    public readonly commandTypes: T[];
    public readonly halt: CommandHaltData<T>['halt'];

    public disabled: boolean;

    constructor(data: CommandHaltData<T>) {
        this.id = data.id;
        this.disabled = data.disabled ?? false;
        this.commandTypes = data.commandTypes;
        this.halt = data.halt;
    }

    /**
     * Sets whether the command halt is disabled.
     * @param disabled Disable the command halt.
     */
    public setDisabled(disabled: boolean): this {
        this.disabled = disabled;
        return this;
    }

    public toJSON(): CommandHaltData<T> {
        return { ...this };
    }

    public async execute<T extends AnyCommandHaltTriggerData = AnyCommandHaltTriggerData, D extends any = any>(trigger: T): Promise<CommandHaltResultData<T['commandType'], D>|null> {
        let data: CommandHaltResultResolvable<T['commandType'], D>;

        switch (trigger.commandType) {
            case CommandType.ContextMenuCommand:
                data = await Promise.resolve((this.halt as ContextMenuCommandHaltFunction)(trigger));
                break;
            case CommandType.MessageCommand:
                data = await Promise.resolve((this.halt as MessageCommandHaltFunction)(trigger));
                break;
            case CommandType.SlashCommand:
                data = await Promise.resolve((this.halt as SlashCommandHaltFunction)(trigger));
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

    public static from<T extends CommandType = CommandType>(data: CommandHaltResolvable<T>): CommandHalt<T> {
        return new CommandHalt((isJSONEncodable(data) ? data.toJSON() : data) as CommandHaltData<T>);
    }

    public static resolve<T extends CommandType = CommandType>(data: CommandHaltResolvable<T>): CommandHalt<T> {
        return data instanceof CommandHalt ? data : this.from(data);
    }
}

export type CommandHaltResolvable<T extends CommandType = CommandType> = JSONEncodable<CommandHaltData<CommandType>>|CommandHaltData<CommandType>;
