import { AnyCommandExecuteFunction, AnyCommandHaltFunction } from '../../types/structures';
import { PermissionResolvable, PermissionsBitField, RestOrArray, normalizeArray } from 'discord.js';
import { CommandType } from '../../types/constants';
import { BaseCommandValidators } from '../validators/BaseCommandValidators';

export interface BaseCommandBuilderData {
    command_type: CommandType;
    cooldown?: number;
    required_bot_permissions?: PermissionResolvable;
    required_member_permissions?: PermissionResolvable;
    preconditions?: string[];
    halt?: AnyCommandHaltFunction;
    execute: AnyCommandExecuteFunction;
}

export abstract class BaseCommandBuilder implements BaseCommandBuilderData {
    public abstract readonly command_type: CommandType;
    public cooldown?: number;
    public required_bot_permissions?: bigint;
    public required_member_permissions?: bigint;
    public preconditions: string[] = [];
    public halt?: AnyCommandHaltFunction;
    public execute: AnyCommandExecuteFunction = () => {};

    constructor(data?: Omit<Partial<BaseCommandBuilderData>, 'command_type'>) {
        if (data?.cooldown) this.setCooldown(data.cooldown);
        if (data?.required_bot_permissions) this.setRequiredBotPermissions(data.required_bot_permissions);
        if (data?.required_member_permissions) this.setRequiredMemberPermissions(data.required_member_permissions);
        if (data?.preconditions) this.setPreconditions(data.preconditions);
        if (data?.halt) this.setHalt(data.halt);
        if (data?.execute) this.setExecute(data.execute);
    }

    public setCooldown(ms: number): this {
        BaseCommandValidators.isValidCooldown(ms);
        this.cooldown = ms;
        return this;
    }

    public setRequiredBotPermissions(permissions: PermissionResolvable|null): this {
        BaseCommandValidators.isValidRequiredBotPermissions(permissions);
        this.required_bot_permissions = permissions ? PermissionsBitField.resolve(permissions) : undefined;
        return this;
    }

    public setRequiredMemberPermissions(permissions: PermissionResolvable|null): this {
        BaseCommandValidators.isValidRequiredMemberPermissions(permissions);
        this.required_member_permissions = permissions ? PermissionsBitField.resolve(permissions) : undefined;
        return this;
    }

    public addPreconditions(...preconditionIds: RestOrArray<string>): this {
        const ids = normalizeArray(preconditionIds);
        BaseCommandValidators.isValidPreconditions(ids);
        this.preconditions.push(...ids);
        return this;
    }

    public setPreconditions(...preconditionIds: RestOrArray<string>): this {
        const ids = normalizeArray(preconditionIds);
        BaseCommandValidators.isValidPreconditions(ids);
        this.preconditions = ids;
        return this;
    }

    public setHalt(halt: AnyCommandHaltFunction|null): this {
        BaseCommandValidators.isValidHalt(halt ?? undefined);
        this.halt = halt ?? undefined;
        return this;
    }

    public setExecute(execute: AnyCommandExecuteFunction): this {
        BaseCommandValidators.isValidExecute(execute);
        this.execute = execute;
        return this;
    }

    public isContextMenuCommand(): this is BaseCommandBuilder & { type: CommandType.ContextMenuCommand } {
        return this.command_type === CommandType.ContextMenuCommand;
    }

    public isMessageCommand(): this is BaseCommandBuilder & { type: CommandType.MessageCommand } {
        return this.command_type === CommandType.MessageCommand;
    }

    public isSlashCommand(): this is BaseCommandBuilder & { type: CommandType.SlashCommand } {
        return this.command_type === CommandType.SlashCommand;
    }
}
