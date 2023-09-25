import { AnyCommandExecuteFunction, AnyCommandHaltFunction, AnyCommandPreconditionFunction } from '../../types/structures';
import { PermissionResolvable, PermissionsBitField, RestOrArray, normalizeArray } from 'discord.js';
import { CommandType } from '../../types/constants';
import { BaseCommandValidators } from '../structures/BaseCommandValidators';

export interface BaseCommandBuilderData {
    command_type: CommandType;
    cooldown?: number;
    required_bot_permissions?: PermissionResolvable;
    required_member_permissions?: PermissionResolvable;
    preconditions?: (AnyCommandPreconditionFunction|string)[];
    halt?: AnyCommandHaltFunction;
    execute: AnyCommandExecuteFunction;
}

export abstract class BaseCommandBuilder implements BaseCommandBuilderData {
    public readonly command_type: CommandType;
    public cooldown?: number;
    public required_bot_permissions?: bigint;
    public required_member_permissions?: bigint;
    public preconditions: (AnyCommandPreconditionFunction|string)[];
    public halt?: AnyCommandHaltFunction;
    public execute: AnyCommandExecuteFunction = () => {};

    constructor(data?: BaseCommandBuilderData) {
        BaseCommandValidators.isValidBaseCommandBuilderData(data);

        this.command_type = data.command_type;
        this.cooldown = data.cooldown;
        this.required_bot_permissions = data.required_bot_permissions && PermissionsBitField.resolve(data.required_bot_permissions);
        this.required_member_permissions = data.required_member_permissions && PermissionsBitField.resolve(data.required_member_permissions);
        this.preconditions = data.preconditions ?? [];
        this.halt = data.halt;
        this.execute = data.execute;
    }

    public setCooldown(ms: number): this {
        this.cooldown = ms;
        return this;
    }

    public setRequiredBotPermissions(permissions: PermissionResolvable|null): this {
        this.required_bot_permissions = permissions ? PermissionsBitField.resolve(permissions) : undefined;
        return this;
    }

    public setRequiredMemberPermissions(permissions: PermissionResolvable|null): this {
        this.required_member_permissions = permissions ? PermissionsBitField.resolve(permissions) : undefined;
        return this;
    }

    public addPreconditions(...preconditionIds: RestOrArray<string>): this {
        this.preconditions.push(...normalizeArray(preconditionIds));
        return this;
    }

    public setPreconditions(...preconditionIds: RestOrArray<string>): this {
        this.preconditions = normalizeArray(preconditionIds);
        return this;
    }

    public setHalt(halt: AnyCommandHaltFunction|null): this {
        this.halt = halt ?? undefined;
        return this;
    }

    public setExecute(execute: AnyCommandExecuteFunction): this {
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
