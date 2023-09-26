import { ApplicationCommandType, Awaitable, ContextMenuCommandInteraction, ContextMenuCommandType, ContextMenuCommandBuilder as DiscordJsContextMenuCommandBuilder, JSONEncodable, PermissionsBitField, PermissionResolvable, RESTPostAPIContextMenuApplicationCommandsJSONBody, SlashCommandAssertions, isJSONEncodable } from 'discord.js';
import { Mixin } from 'ts-mixer';
import { BaseCommandBuilder, BaseCommandBuilderData } from './BaseCommandBuilder';
import { CommandType } from '../../types/constants';
import { RecipleClient } from '../structures/RecipleClient';
import { CommandHaltData } from '../../types/structures';

export interface ContextMenuCommandExecuteData {
    type: CommandType.ContextMenuCommand;
    client: RecipleClient<true>;
    interaction: ContextMenuCommandInteraction;
    builder: ContextMenuCommandBuilder;
}

export type ContextMenuCommandHaltData = CommandHaltData<CommandType.ContextMenuCommand>;

export type ContextMenuCommandExecuteFunction = (executeData: ContextMenuCommandExecuteData) => Awaitable<void>;
export type ContextMenuCommandHaltFunction = (haltData: ContextMenuCommandHaltData) => Awaitable<boolean>;

export interface ContextMenuCommandBuilderData extends BaseCommandBuilderData, Omit<RESTPostAPIContextMenuApplicationCommandsJSONBody, 'options'|'description'|'description_localizations'|'type'> {
    command_type: CommandType.ContextMenuCommand;
    type: ContextMenuCommandType|'Message'|'User';
    halt?: ContextMenuCommandHaltFunction;
    execute: ContextMenuCommandExecuteFunction;
}

export interface ContextMenuCommandBuilder extends DiscordJsContextMenuCommandBuilder, BaseCommandBuilder {
    halt?: ContextMenuCommandHaltFunction;
    execute: ContextMenuCommandExecuteFunction;

    setHalt(halt: ContextMenuCommandHaltFunction|null): this;
    setExecute(execute: ContextMenuCommandExecuteFunction): this;
}

export class ContextMenuCommandBuilder extends Mixin(DiscordJsContextMenuCommandBuilder, BaseCommandBuilder) {
    public readonly command_type: CommandType.ContextMenuCommand = CommandType.ContextMenuCommand;

    constructor(data?: Omit<Partial<ContextMenuCommandBuilderData>, 'command_type'>) {
        super(data);

        if (data?.default_member_permissions) this.setDefaultMemberPermissions(data.default_member_permissions);
        if (data?.dm_permission) this.setDMPermission(data.dm_permission);
        if (data?.default_permission !== undefined) this.setDefaultPermission(data.default_permission);
        if (data?.execute) this.setExecute(data.execute);
        if (data?.halt) this.setHalt(data.halt);
        if (data?.name) this.setName(data.name);
        if (data?.name_localizations) this.setNameLocalizations(data.name_localizations);
        if (data?.nsfw) this.setNSFW(data.nsfw);
        if (data?.type) this.setType(data.type);
    }

    public setNSFW(nsfw: boolean) {
        SlashCommandAssertions.validateNSFW(nsfw);
        Reflect.set(this, "nsfw", nsfw);
        return this;
    }

    public setType(type: ContextMenuCommandType|'Message'|'User'): this {
        return super.setType(typeof type === 'number'
            ? type
            : type === 'Message'
                ? ApplicationCommandType.Message
                : ApplicationCommandType.User);
    }

    public setDefaultMemberPermissions(permissions?: string|number|bigint|null): this {
        return super.setRequiredMemberPermissions(permissions ? BigInt(permissions) : null);
    }

    public setRequiredMemberPermissions(permissions: PermissionResolvable|null): this {
        const bigint = permissions ? PermissionsBitField.resolve(permissions) : null;
        return super.setDefaultMemberPermissions(bigint).setRequiredMemberPermissions(bigint);
    }

    public toJSON(): RESTPostAPIContextMenuApplicationCommandsJSONBody & ContextMenuCommandBuilderData {
        return {
            ...super.toJSON(),
            ...super._toJSON()
        }
    }

    public static from(data: ContextMenuCommandResolvable): ContextMenuCommandBuilder {
        return new ContextMenuCommandBuilder(isJSONEncodable(data) ? data.toJSON() : data);
    }

    public static resolve(data: ContextMenuCommandBuilder): ContextMenuCommandBuilder {
        return data instanceof ContextMenuCommandBuilder ? data : this.from(data);
    }
}

export type ContextMenuCommandResolvable = ContextMenuCommandBuilderData|JSONEncodable<ContextMenuCommandBuilderData>;
