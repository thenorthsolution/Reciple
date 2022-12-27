import { ApplicationCommand, ApplicationCommandDataResolvable, Awaitable, Collection, Client as DiscordJsClient, ClientOptions as DiscordJsClientOptions } from 'discord.js';
import { TypedEmitter } from 'tiny-typed-emitter';
import { Config } from '../types/Config';
import { ModuleManager } from './managers/ModuleManager';
import { CommandManager } from './managers/CommandManager';
import { ApplicationCommandManager } from './managers/ApplicationCommandManager';

export interface ClientOptions extends DiscordJsClientOptions {
    config?: Config;
}

export interface ClientEvents {
    recipleCommandExecute: () => Awaitable<void>;
    recipleCommandHalt: () => Awaitable<void>;
    recipleRegisterApplicationCommands: () => Awaitable<void>;
    recipleSetApplicationCommands: (commands: Collection<string, ApplicationCommand>, guildId: string|null) => Awaitable<void>;
    recipleAddApplicationCommand: (command: ApplicationCommand, guildId: string|null) => Awaitable<void>;
    recipleRemoveApplicationCommand: (command: ApplicationCommand|string, guildId: string|null) => Awaitable<void>;
    recipleEditApplicationCommand: (command: ApplicationCommand, guildId: string|null) => Awaitable<void>;
    recipleReplyError: () => Awaitable<void>;
}

export class Client<Ready extends boolean = boolean> extends (DiscordJsClient as { new<Ready extends boolean = boolean>(options: DiscordJsClientOptions): DiscordJsClient<Ready> & TypedEmitter<ClientEvents> })<Ready> {
    readonly modules: ModuleManager = new ModuleManager({ client: this });
    readonly commands: CommandManager = new CommandManager({ client: this });
    readonly applicationCommands: ApplicationCommandManager = new ApplicationCommandManager({ client: this });

    constructor(options: ClientOptions) {
        super(options);
    }

    public isReady(): this is Client<true> {
        return super.isReady();
    }
}
