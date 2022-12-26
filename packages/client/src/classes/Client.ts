import { Awaitable, Client as DiscordJsClient, ClientOptions as DiscordJsClientOptions } from 'discord.js';
import { TypedEmitter } from 'tiny-typed-emitter';
import { Config } from '../types/Config';

export interface ClientOptions extends DiscordJsClientOptions {
    config?: Config;
}

export interface ClientEvents {
    recipleCommandExecute: () => Awaitable<void>;
    recipleCommandHalt: () => Awaitable<void>;
    recipleRegisterApplicationCommands: () => Awaitable<void>;
    recipleReplyError: () => Awaitable<void>;
}

export class Client<Ready extends boolean = boolean> extends (DiscordJsClient as { new<Ready extends boolean = boolean>(options: DiscordJsClientOptions): DiscordJsClient<Ready> & TypedEmitter<ClientEvents> })<Ready> {
    constructor(options: ClientOptions) {
        super(options);
    }

    public isReady(): this is Client<true> {
        return super.isReady();
    }
}
