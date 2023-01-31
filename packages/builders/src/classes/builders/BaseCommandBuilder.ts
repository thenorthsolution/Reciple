import { ContextMenuCommandBuilder, PermissionResolvable, PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import { AnyCommandExecuteFunction, AnyCommandHaltFunction, CommandType } from '../../types/commands';
import { MessageCommandBuilder } from './MessageCommandBuilder';

export interface BaseCommandBuilderData {
    commandType: CommandType;
    cooldown?: number;
    requiredBotPermissions?: PermissionResolvable;
    requiredMemberPermissions?: PermissionResolvable;
    halt?: AnyCommandHaltFunction;
    execute?: AnyCommandExecuteFunction;
}

export abstract class BaseCommandBuilder implements BaseCommandBuilderData {
    abstract readonly commandType: CommandType;
    abstract halt?: AnyCommandHaltFunction;
    abstract execute?: AnyCommandExecuteFunction;

    public cooldown?: number;
    public requiredBotPermissions?: bigint;
    public requiredMemberPermissions?: bigint;

    constructor(data?: Omit<Partial<BaseCommandBuilderData>, 'commandType'>) {
        this.from(data);
    }

    public abstract setHalt(halt?: AnyCommandHaltFunction|null): this;
    public abstract setExecute(execute?: AnyCommandExecuteFunction|null): this;

    public setCooldown(cooldown?: number|null): this {
        this.cooldown = cooldown || undefined;
        return this;
    }

    public setRequiredBotPermissions(permissions?: PermissionResolvable|null): this {
        this.requiredBotPermissions = permissions ? new PermissionsBitField(permissions).bitfield : undefined;
        return this;
    }

    public setRequiredMemberPermissions(permissions?: PermissionResolvable|null): this {
        this.requiredMemberPermissions = permissions ? new PermissionsBitField(permissions).bitfield : undefined;
        return this;
    }

    public isContextMenu(): this is ContextMenuCommandBuilder {
        return this.commandType === CommandType.ContextMenuCommand;
    }

    public isSlashCommand(): this is SlashCommandBuilder {
        return this.commandType === CommandType.SlashCommand;
    }

    public isMessageCommand(): this is MessageCommandBuilder {
        return this.commandType === CommandType.MessageCommand;
    }

    protected toCommandData(): BaseCommandBuilderData {
        return {
            commandType: this.commandType,
            cooldown: this.cooldown,
            halt: this.halt,
            execute: this.execute,
            requiredBotPermissions: this.requiredBotPermissions,
            requiredMemberPermissions: this.requiredMemberPermissions
        };
    }

    protected from(data?: Omit<Partial<BaseCommandBuilderData>, 'commandType'>): void {
        if (data?.cooldown !== undefined) this.setCooldown(Number(data?.cooldown));
        if (data?.requiredBotPermissions !== undefined) this.setRequiredBotPermissions(data.requiredBotPermissions);
        if (data?.requiredMemberPermissions !== undefined) this.setRequiredMemberPermissions(data.requiredMemberPermissions);
        if (data?.halt !== undefined) this.setHalt(data.halt);
        if (data?.execute !== undefined) this.setExecute(data.execute);
    }
}
