import { PermissionResolvable, PermissionsBitField, RestOrArray, isJSONEncodable, normalizeArray } from 'discord.js';
import { AnyCommandExecuteFunction } from '../../types/structures.js';
import { CommandPrecondition, CommandPreconditionResolvable } from '../structures/CommandPrecondition.js';
import { BaseCommandValidators } from '../validators/BaseCommandValidators.js';
import { ContextMenuCommandBuilder } from './ContextMenuCommandBuilder.js';
import { MessageCommandBuilder } from './MessageCommandBuilder.js';
import { SlashCommandBuilder } from './SlashCommandBuilder.js';
import { CommandType } from '../../types/constants.js';
import { CommandHalt, CommandHaltData, CommandHaltResolvable } from '../structures/CommandHalt.js';

export interface BaseCommandBuilderData {
    command_type: CommandType;
    cooldown?: number|null;
    required_bot_permissions?: PermissionResolvable;
    required_member_permissions?: PermissionResolvable;
    preconditions?: CommandPreconditionResolvable[];
    disabled_preconditions?: (CommandPreconditionResolvable|string)[];
    disabled_halts?: (CommandHaltResolvable|string)[];
    halts?: CommandHaltResolvable[];
    execute: AnyCommandExecuteFunction;
}

export abstract class BaseCommandBuilder implements BaseCommandBuilderData {
    public abstract readonly command_type: CommandType;
    public cooldown?: number|null;
    public required_bot_permissions?: bigint;
    public required_member_permissions?: bigint;
    public preconditions: CommandPreconditionResolvable[] = [];
    public disabled_preconditions: string[] = [];
    public disabled_halts: string[] = [];
    public halts: CommandHalt<CommandType>[] = [];
    public execute: AnyCommandExecuteFunction = () => {};

    constructor(data?: Omit<Partial<BaseCommandBuilderData>, 'command_type'>) {
        if (data?.cooldown) this.setCooldown(data.cooldown);
        if (data?.required_bot_permissions) this.setRequiredBotPermissions(data.required_bot_permissions);
        if (data?.required_member_permissions) this.setRequiredMemberPermissions(data.required_member_permissions);
        if (data?.preconditions) this.setPreconditions(data.preconditions);
        if (data?.halts) this.setHalts(data.halts);
        if (data?.execute) this.setExecute(data.execute);
    }

    public setCooldown(ms: number|null): this {
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
        BaseCommandValidators.isValidDisabledPreconditions(ids);
        this.disabled_preconditions.push(...ids.map(p => typeof p === 'string' ? p : CommandPrecondition.resolve(p).id));
        return this;
    }

    public setDisabledPreconditions(...preconditionIds: RestOrArray<CommandPreconditionResolvable>): this {
        const ids = normalizeArray(preconditionIds);
        BaseCommandValidators.isValidDisabledPreconditions(ids);
        this.disabled_preconditions = ids.map(p => typeof p === 'string' ? p : CommandPrecondition.resolve(p).id);
        return this;
    }

    public addHalts(...halts: RestOrArray<CommandHaltResolvable>): this {
        halts = normalizeArray(halts);
        BaseCommandValidators.isValidHalts(halts);
        this.halts.push(...halts.map(h => CommandHalt.resolve(h)));
        return this;
    }

    public setHalts(...halts: RestOrArray<CommandHaltResolvable<CommandType>>): this {
        halts = normalizeArray(halts);
        BaseCommandValidators.isValidHalts(halts);
        this.halts = halts.map(h => CommandHalt.resolve(h));
        return this;
    }

    public addDisabledHalts(...haltIds: RestOrArray<CommandHaltResolvable>): this {
        const ids = normalizeArray(haltIds);
        BaseCommandValidators.isValidDisabledHalts(ids);
        this.disabled_halts.push(...ids.map(h => typeof h === 'string' ? h : CommandHalt.resolve(h).id));
        return this;
    }

    public setDisabledHalts(...haltIds: RestOrArray<CommandHaltResolvable>): this {
        const ids = normalizeArray(haltIds);
        BaseCommandValidators.isValidDisabledHalts(ids);
        this.disabled_halts = ids.map(h => typeof h === 'string' ? h : CommandHalt.resolve(h).id);
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

    protected _toJSON<C extends CommandType = CommandType, E extends AnyCommandExecuteFunction = AnyCommandExecuteFunction>(): Omit<BaseCommandBuilderData, 'command_type'|'halt'|'execute'> & { command_type: C; halts?: CommandHaltData<C>[]; execute: E; } {
        return {
            command_type: this.command_type as C,
            cooldown: this.cooldown,
            required_bot_permissions: this.required_bot_permissions,
            required_member_permissions: this.required_member_permissions,
            preconditions: this.preconditions.map(p => isJSONEncodable(p) ? p.toJSON() : p),
            halts: this.halts.map(h => isJSONEncodable(h) ? h.toJSON() : h) as CommandHaltData<C>[],
            execute: this.execute as E,
        };
    }
}
