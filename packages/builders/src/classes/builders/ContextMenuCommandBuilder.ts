import discordjs, { Awaitable, ContextMenuCommandInteraction, ContextMenuCommandType } from 'discord.js';
import { BaseInteractionBasedCommandData, CommandType } from '../../types/commands';
import { BaseCommandBuilder, BaseCommandBuilderData } from './BaseCommandBuilder';
import { CommandHaltData } from '../../types/halt';
import { RecipleClient } from '../RecipleClient';
import { mix } from 'ts-mixer';

export interface ContextMenuCommandExecuteData<Metadata = unknown> {
    commandType: CommandType.ContextMenuCommand;
    RecipleClient: RecipleClient;
    interaction: ContextMenuCommandInteraction;
    builder: ContextMenuCommandBuilder<Metadata>;
}

export type ContextMenuCommandHaltData<Metadata = unknown> = CommandHaltData<CommandType.ContextMenuCommand, Metadata>;

export type ContextMenuCommandExecuteFunction<Metadata = unknown> = (executeData: ContextMenuCommandExecuteData<Metadata>) => Awaitable<void>;
export type ContextMenuCommandHaltFunction<Metadata = unknown> = (haltData: ContextMenuCommandHaltData<Metadata>) => Awaitable<boolean>;

export type ContextMenuCommandResolvable<Metadata = unknown> = ContextMenuCommandBuilder<Metadata>|ContextMenuCommandData<Metadata>;

export interface ContextMenuCommandData<Metadata = unknown> extends BaseCommandBuilderData<Metadata>, BaseInteractionBasedCommandData<false> {
    commandType: CommandType.ContextMenuCommand;
    type: ContextMenuCommandType;
    halt?: ContextMenuCommandHaltFunction<Metadata>;
    execute?: ContextMenuCommandExecuteFunction<Metadata>;
}

export interface ContextMenuCommandBuilder<Metadata = unknown> extends discordjs.ContextMenuCommandBuilder, BaseCommandBuilder<Metadata> {}

@mix(discordjs.ContextMenuCommandBuilder, BaseCommandBuilder)
export class ContextMenuCommandBuilder<Metadata = unknown> {
    readonly commandType: CommandType.ContextMenuCommand = CommandType.ContextMenuCommand;

    public halt?: ContextMenuCommandHaltFunction<Metadata>;
    public execute?: ContextMenuCommandExecuteFunction<Metadata>;

    constructor(data?: Omit<Partial<ContextMenuCommandData<Metadata>>, 'commandType'>) {
        this.from(data);

        if (data?.name !== undefined) this.setName(data.name);
        if (data?.nameLocalizations !== undefined) this.setNameLocalizations(data.nameLocalizations);
    }

    public setHalt(halt?: ContextMenuCommandHaltFunction<Metadata>|null): this {
        this.halt = halt || undefined;
        return this;
    }

    public setExecute(execute?: ContextMenuCommandExecuteFunction<Metadata>|null): this {
        this.execute = execute || undefined;
        return this;
    }

    public static resolve<Metadata>(contextMenuCommandResolvable: ContextMenuCommandResolvable<Metadata>): ContextMenuCommandBuilder<Metadata> {
        return contextMenuCommandResolvable instanceof ContextMenuCommandBuilder ? contextMenuCommandResolvable : new ContextMenuCommandBuilder(contextMenuCommandResolvable);
    }
}
