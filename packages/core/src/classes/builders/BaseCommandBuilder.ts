import { PermissionResolvable, PermissionsBitField, RestOrArray, isJSONEncodable, normalizeArray } from 'discord.js';
import { AnyCommandExecuteFunction, AnyCommandHaltFunction } from '../../types/structures';
import { CommandPreconditionResolvable } from '../structures/CommandPrecondition';
import { BaseCommandValidators } from '../validators/BaseCommandValidators';
import { ContextMenuCommandBuilder } from './ContextMenuCommandBuilder';
import { MessageCommandBuilder } from './MessageCommandBuilder';
import { SlashCommandBuilder } from './SlashCommandBuilder';
import { CommandType } from '../../types/constants';

export interface BaseCommandBuilderData {
    command_type: CommandType;
    cooldown?: number;
    required_bot_permissions?: PermissionResolvable;
    required_member_permissions?: PermissionResolvable;
    preconditions?: CommandPreconditionResolvable[];
    disabled_preconditions?: CommandPreconditionResolvable[];
    halt?: AnyCommandHaltFunction;
    execute: AnyCommandExecuteFunction;
}

export abstract class BaseCommandBuilder implements BaseCommandBuilderData {
    public abstract readonly command_type: CommandType;
    public cooldown?: number;
    public required_bot_permissions?: bigint;
    public required_member_permissions?: bigint;
    public preconditions: CommandPreconditionResolvable[] = [];
    public disabled_preconditions: CommandPreconditionResolvable[] = [];
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

    public addPreconditions(...preconditionIds: RestOrArray<CommandPreconditionResolvable>): this {
        const ids = normalizeArray(preconditionIds);
        BaseCommandValidators.isValidPreconditions(ids);
        this.preconditions.push(...ids);
        return this;
    }

    public setPreconditions(...preconditionIds: RestOrArray<CommandPreconditionResolvable>): this {
        const ids = normalizeArray(preconditionIds);
        BaseCommandValidators.isValidPreconditions(ids);
        this.preconditions = ids;
        return this;
    }

    public addDisabledPreconditions(...preconditionIds: RestOrArray<CommandPreconditionResolvable>): this {
        const ids = normalizeArray(preconditionIds);
        BaseCommandValidators.isValidPreconditions(ids);
        this.disabled_preconditions.push(...ids);
        return this;
    }

    public setDisabledPreconditions(...preconditionIds: RestOrArray<CommandPreconditionResolvable>): this {
        const ids = normalizeArray(preconditionIds);
        BaseCommandValidators.isValidPreconditions(ids);
        this.disabled_preconditions = ids;
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

    public isContextMenuCommand(): this is ContextMenuCommandBuilder {
        return this.command_type === CommandType.ContextMenuCommand;
    }

    public isMessageCommand(): this is MessageCommandBuilder {
        return this.command_type === CommandType.MessageCommand;
    }

    public isSlashCommand(): this is SlashCommandBuilder {
        return this.command_type === CommandType.SlashCommand;
    }

    protected _toJSON<C extends CommandType = CommandType, H extends AnyCommandHaltFunction = AnyCommandHaltFunction, E extends AnyCommandExecuteFunction = AnyCommandExecuteFunction>(): Omit<BaseCommandBuilderData, 'command_type'|'halt'|'execute'> & { command_type: C; halt?: H; execute: E; } {
        return {
            command_type: this.command_type as C,
            cooldown: this.cooldown,
            required_bot_permissions: this.required_bot_permissions,
            required_member_permissions: this.required_member_permissions,
            preconditions: this.preconditions.map(p => isJSONEncodable(p) ? p.toJSON() : p),
            halt: this.halt as H,
            execute: this.execute as E,
        };
    }
}

// TODO: Command scope precondition
