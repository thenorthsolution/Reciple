import { AnyCommandExecuteData, RecipleClientConfig } from '../../types/structures.js';
import { ApplicationCommand, Awaitable, Client, ClientEvents, Collection } from 'discord.js';
import { CommandHaltReason, CommandType, version } from '../../types/constants.js';
import { CommandPreconditionResultData } from './CommandPrecondition.js';
import { CooldownManager } from '../managers/CooldownManager.js';
import { CommandManager } from '../managers/CommandManager.js';
import { ModuleManager } from '../managers/ModuleManager.js';
import { CommandHaltResultData } from './CommandHalt.js';
import { RecipleError } from './RecipleError.js';
import { Logger } from 'fallout-utility/Logger';
import { If } from 'fallout-utility/types';

export interface RecipleClientEvents extends ClientEvents {
    recipleCommandExecute: [executeData: AnyCommandExecuteData];
    recipleCommandHalt: [haltData: CommandHaltResultData];
    recipleCommandPrecondition: [executeData: CommandPreconditionResultData];
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

    off<E extends keyof RecipleClientEvents>(event: E, listener: (...args: RecipleClientEvents[E]) => Awaitable<void>): this;
    off<E extends string | symbol>(event: E, listener: (...args: any) => Awaitable<void>): this;

    removeAllListeners<E extends keyof RecipleClientEvents>(event?: E): this;
    removeAllListeners(event?: string | symbol): this;

    removeListener<E extends keyof RecipleClientEvents>(event: E, listener: Function): this;
    removeListener(event: string | symbol, listener: Function): this;
    isReady(): this is RecipleClient<true>;
}

export class RecipleClient<Ready extends boolean = boolean> extends Client<Ready> {
    readonly version = version;

    protected _commands: CommandManager|null = null;
    protected _cooldowns: CooldownManager|null = null;

    get commands() { return this._commands as If<Ready, CommandManager>; }
    get cooldowns() { return this._cooldowns as If<Ready, CooldownManager>; }

    public modules: ModuleManager = new ModuleManager(this);
    public logger: Logger|null = null;

    constructor(readonly config: RecipleClientConfig & Record<string, any>) {
        super(config.client);
    }

    public setLogger(logger: Logger|null): this {
        this.logger = logger ?? null;
        return this;
    }

    public async login(token?: string): Promise<string> {
        if (token) Reflect.set(this.config, 'token', token);

        this._commands = new CommandManager(this as RecipleClient<true>);
        this._cooldowns = new CooldownManager(this as RecipleClient<true>);

        this.cooldowns?.setCooldownSweeper(this.config.cooldownSweeperOptions ?? { timer: 1000 * 60 * 60 });

        if (this.config.preconditions) this.commands?.addPreconditions(this.config.preconditions);
        if (this.config.commandHalts) this.commands?.addHalts(this.config.commandHalts);

        token = await super.login(this.config.token);

        return token;
    }

    public async destroy(clearModules?: boolean): Promise<void> {
        await this.modules.unloadModules({ removeFromCache: false }).catch(() => null);
        await super.destroy();

        this._commands = null;
        this._cooldowns = null;

        if (clearModules) this.modules.cache.clear();
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
            // @ts-expect-error Types is broken here
            const haltData = await this.commands!.executeHalts({
                commandType: data.type,
                reason: CommandHaltReason.Error,
                executeData: data,
                error
            })
            .catch(err => {
                this._throwError(new RecipleError(RecipleError.createCommandHaltErrorOptions(data.builder, err)));
                return null;
            });

            if (haltData === false) this._throwError(new RecipleError(RecipleError.createCommandExecuteErrorOptions(data.builder, error)))
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
