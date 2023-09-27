import { AnyCommandExecuteData, AnyCommandHaltData, RecipleClientConfig } from '../../types/structures';
import { ApplicationCommand, Awaitable, Client, ClientEvents, ClientOptions, Collection } from 'discord.js';
import { CooldownManager } from '../managers/CooldownManager';
import { If } from 'fallout-utility';
import { CommandManager } from '../managers/CommandManager';
import { CommandPreconditionTriggerData } from './CommandPrecondition';
import { CommandHaltReason, CommandType } from '../../types/constants';
import { RecipleError } from './RecipleError';

export interface RecipleClientOptions extends RecipleClientConfig {
    client: ClientOptions;
}

export interface RecipleClientEvents extends ClientEvents {
    recipleCommandExecute: [executeData: AnyCommandExecuteData];
    recipleCommandHalt: [haltData: AnyCommandHaltData];
    recipleCommandPrecondition: [executeData: CommandPreconditionTriggerData];
    recipleRegisterApplicationCommands: [commands: Collection<string, ApplicationCommand>, guildId?: string];
    recipleError: [error: Error];
    recipleDebug: [message: string];
}

export interface RecipleClient<Ready extends boolean = boolean> extends Client<Ready> {
    on<E extends keyof RecipleClientEvents>(event: E, listener: (...args: RecipleClientEvents[E]) => Awaitable<void>): this;
    on<E extends string|symbol>(event: E, listener: (...args: any) => Awaitable<void>): this;

    once<E extends keyof RecipleClientEvents>(event: E, listener: (...args: RecipleClientEvents[E]) => Awaitable<void>): this;
    once<E extends string | symbol>(event: E, listener: (...args: any) => Awaitable<void>): this;

    emit<E extends keyof RecipleClientEvents>(event: E, ...args: RecipleClientEvents[E]): boolean;
    emit<E extends string | symbol>(event: E, ...args: any): boolean;

    off<E extends keyof RecipleClientEvents>(event: E, listener: (...args: RecipleClientEvents[E]) => Awaitable<void>): this;
    off<E extends string | symbol>(event: E, listener: (...args: any) => Awaitable<void>): this;

    removeAllListeners<E extends keyof RecipleClientEvents>(event?: E): this;
    removeAllListeners(event?: string | symbol): this;

    removeListener<E extends keyof RecipleClientEvents>(event: E, listener: Function): this;
    removeListener(event: string | symbol, listener: Function): this;
    isReady(): this is RecipleClient<true>;
}

export class RecipleClient<Ready extends boolean = boolean> extends Client<Ready> {
    protected _commands: CommandManager|null = null;
    protected _cooldowns: CooldownManager|null = null;

    get commands() { return this._cooldowns as If<Ready, CommandManager>; }
    get cooldowns() { return this._cooldowns as If<Ready, CooldownManager>; }

    constructor(readonly config: RecipleClientOptions) {
        super(config.client);
    }

    public async login(): Promise<string> {
        const token = await super.login();

        this._commands = new CommandManager(this as RecipleClient<true>);
        this._cooldowns = new CooldownManager(this as RecipleClient<true>);

        this.cooldowns?.setCooldownSweeper(this.config.cooldownSweeperOptions);

        return token;
    }

    public async executeCommandBuilderHalt(data: AnyCommandHaltData): Promise<boolean> {
        try {
            if (data.executeData.builder.halt) {
                switch (data.commandType) {
                    case CommandType.ContextMenuCommand:
                        await data.executeData.builder.halt(data);
                        break;
                    case CommandType.MessageCommand:
                        await data.executeData.builder.halt(data);
                        break;
                    case CommandType.SlashCommand:
                        await data.executeData.builder.halt(data);
                        break;
                }
            }

            return this.emit('recipleCommandHalt', data);
        } catch (error) {
            this._throwError(new RecipleError(RecipleError.createCommandHaltErrorOptions(data.executeData.builder, error)));
        }

        return false;
    }

    public async executeCommandBuilderExecute(data: AnyCommandExecuteData): Promise<boolean> {
        try {
            switch (data.type) {
                case CommandType.ContextMenuCommand:
                    await data.builder.execute(data);
                    break;
                case CommandType.MessageCommand:
                    await data.builder.execute(data);
                    break;
                case CommandType.SlashCommand:
                    await data.builder.execute(data);
                    break;
            }

            return this.emit('recipleCommandExecute', data);
        } catch (error) {
            // @ts-expect-error Typing is broken here
            const isHandled = await this.executeCommandBuilderHalt({
                commandType: data.type,
                reason: CommandHaltReason.Error,
                executeData: data,
                error
            });

            if (!isHandled) this._throwError(new RecipleError(RecipleError.createCommandExecuteErrorOptions(data.builder, error)));
        }

        return false;
    }

    public _throwError(error: Error, throwWhenNoListener: boolean = true): void {
        if (!this.listenerCount('recipleError')) {
            if (!throwWhenNoListener) return;
            throw error;
        }
        this.emit('recipleError', error);
    }
}
