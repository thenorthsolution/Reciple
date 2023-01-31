import discordjs, { ApplicationCommand, Awaitable, ClientEvents, Collection } from 'discord.js';
import { RecipleClientOptions, RecipleConfigOptions } from '../types/config';
import { CommandCooldownManager } from './managers/CommandCooldownManager';
import { Logger } from 'fallout-utility';
import { AnyCommandBuilder, AnyCommandData, AnyCommandExecuteData, AnyCommandHaltData, CommandType } from '../types/commands';
import { CommandManager } from './managers/CommandManager';
import { ContextMenuCommandExecuteData, ContextMenuCommandHaltData, ContextMenuCommandResolvable } from './builders/ContextMenuCommandBuilder';
import { MessageCommandExecuteData, MessageCommandHaltData, MessageCommandResovable } from './builders/MessageCommandBuilder';
import { SlashCommandExecuteData, SlashCommandHaltData, SlashCommandResolvable } from './builders/SlashCommandBuilder';
import { CommandHaltReason } from '../types/halt';

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

    public _throwError(error: Error, throwWhenNoListener: boolean = true): void {
        if (!this.listenerCount('recipleError')) {
            if (!throwWhenNoListener) return;
            throw error;
        }
        this.emit('recipleError', error);
    }

    public async _haltCommand(command: ContextMenuCommandResolvable, haltData: ContextMenuCommandHaltData): Promise<boolean>;
    public async _haltCommand(command: MessageCommandResovable, haltData: MessageCommandHaltData): Promise<boolean>;
    public async _haltCommand(command: SlashCommandResolvable, haltData: SlashCommandHaltData): Promise<boolean>;
    public async _haltCommand(command: AnyCommandBuilder|AnyCommandData, haltData: AnyCommandHaltData): Promise<boolean> {
        const haltResolve = await Promise.resolve(command.halt
            ? command.commandType  === CommandType.ContextMenuCommand
                ? command.halt(haltData as ContextMenuCommandHaltData)
                : command.commandType === CommandType.MessageCommand
                    ? command.halt(haltData as MessageCommandHaltData)
                    : command.commandType === CommandType.SlashCommand
                        ? command.halt(haltData as SlashCommandHaltData)
                        : false
            : false)
            .then(res => {
                this.emit('recipleCommandHalt', haltData);
                return res;
            })
            .catch(err => this._throwError(err));

        return haltResolve ?? true;
    }

    public async _executeCommand(command: ContextMenuCommandResolvable, executeData: ContextMenuCommandExecuteData): Promise<boolean>;
    public async _executeCommand(command: MessageCommandResovable, executeData: MessageCommandExecuteData): Promise<boolean>;
    public async _executeCommand(command: SlashCommandResolvable, executeData: SlashCommandExecuteData): Promise<boolean>;
    public async _executeCommand(command: AnyCommandBuilder|AnyCommandData, executeData: AnyCommandExecuteData): Promise<boolean> {
        if (!command.execute) {
            // @ts-expect-error
            await this._haltCommand(command, { commandType: command.commandType, reason: CommandHaltReason.NoExecuteHandler, executeData });
            return false;
        }

        return !!await Promise.resolve(command.halt
            ? command.commandType  === CommandType.ContextMenuCommand
                ? command.execute(executeData as ContextMenuCommandExecuteData)
                : command.commandType === CommandType.MessageCommand
                    ? command.execute(executeData as MessageCommandExecuteData)
                    : command.commandType === CommandType.SlashCommand
                        ? command.execute(executeData as SlashCommandExecuteData)
                        : false
            : false
        )
        .then(() => this.emit('recipleCommandExecute', executeData))
        .catch(err => {
            // @ts-expect-error
            const isHandled = await this._haltCommand(command, { commandType: command.commandType, reason: CommandHaltReason.Error, executeData, error: err });
            if (!isHandled) this._throwError(err);
        });
    }
}
