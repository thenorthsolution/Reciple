import { isJSONEncodable, JSONEncodable } from 'discord.js';
import { CommandType } from '../../types/constants.js';
import { AnyCommandHaltFunction, AnyCommandHaltTriggerData } from '../../types/structures.js';
import { ContextMenuCommandHaltFunction, ContextMenuCommandHaltTriggerData } from '../builders/ContextMenuCommandBuilder.js';
import { MessageCommandHaltFunction, MessageCommandHaltTriggerData } from '../builders/MessageCommandBuilder.js';
import { SlashCommandHaltFunction, SlashCommandHaltTriggerData } from '../builders/SlashCommandBuilder.js';

export interface CommandHaltData<T extends CommandType = CommandType> {
    id: string;
    disabled?: boolean;
    commandTypes: T[];
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
    halt: CommandHalt<T>;
    successful: boolean;
    message?: string;
    data?: D;
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
                data = await Promise.resolve((this.halt as ContextMenuCommandHaltFunction)(trigger));;
                break;
            case CommandType.MessageCommand:
                data = await Promise.resolve((this.halt as MessageCommandHaltFunction)(trigger));;
                break;
            case CommandType.SlashCommand:
                data = await Promise.resolve((this.halt as SlashCommandHaltFunction)(trigger));;
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
