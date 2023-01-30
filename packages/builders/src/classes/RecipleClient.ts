import discordjs, { ApplicationCommand, ApplicationCommandDataResolvable, Awaitable, ClientEvents, Collection } from 'discord.js';
import { RecipleClientOptions, RecipleConfigOptions } from '../types/options';
import { CommandCooldownManager } from './managers/CommandCooldownManager';
import { Logger } from 'fallout-utility';
import { AnyCommandExecuteData, AnyCommandHaltData } from '../types/commands';
import { CommandManager } from './managers/CommandManager';

export interface RecipleClient<Ready extends boolean = boolean> extends discordjs.Client<Ready> {
    on<E extends keyof RecipleClientEvents>(event: E, listener: (...args: RecipleClientEvents[E]) => Awaitable<void>): this;
    on<E extends string | symbol>(event: E, listener: (...args: any) => Awaitable<void>): this;

    once<E extends keyof RecipleClientEvents>(event: E, listener: (...args: RecipleClientEvents[E]) => Awaitable<void>): this;
    once<E extends keyof string | symbol>(event: E, listener: (...args: any) => Awaitable<void>): this;

    emit<E extends keyof RecipleClientEvents>(event: E, ...args: RecipleClientEvents[E]): boolean;
    emit<E extends string | symbol>(event: E, ...args: any): boolean;

    off<E extends keyof RecipleClientEvents>(event: E, listener: (...args: RecipleClientEvents[E]) => Awaitable<void>): this;
    off<E extends string | symbol>(event: E, listener: (...args: any) => Awaitable<void>): this;

    removeAllListeners<E extends keyof RecipleClientEvents>(event?: E): this;
    removeAllListeners(event?: string | symbol): this;
}

export interface RecipleClientEvents extends ClientEvents {
    recipleCommandExecute: [executeData: AnyCommandExecuteData];
    recipleCommandHalt: [haltData: AnyCommandHaltData];
    recipleRegisterApplicationCommands: [commands: Collection<string, ApplicationCommand>, guildId: string];
    recipleError: [error: Error];
    recipleDebug: [message: string];
}

export class RecipleClient<Ready extends boolean = boolean> extends discordjs.Client<Ready> {
    readonly config!: RecipleConfigOptions;
    readonly commands: CommandManager = new CommandManager({ client: this });
    readonly cooldowns: CommandCooldownManager = new CommandCooldownManager();
    readonly logger?: Logger;

    constructor(options: RecipleClientOptions) {
        super(options);
    }

    public isReady(): this is RecipleClient<true> {
        return super.isReady();
    }

    public _throwError(error: Error): void {
        if (!this.listenerCount('recipleError')) throw error;
        this.emit('recipleError', error);
    }
}
