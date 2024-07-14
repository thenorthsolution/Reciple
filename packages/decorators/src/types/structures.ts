import type { AnyCommandBuilder, ModuleManagerEvents, RecipleClientEvents } from '@reciple/core';
import type { Collection, GatewayDispatchEvents, RestEvents } from 'discord.js';

export type TypedMethodDecorator<T> = (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T> | void;

export interface RecipleModuleDecoratorMetadata {
    id?: string;
    name?: string;
    commands?: AnyCommandBuilder[];
    versions?: string|string[];
    eventsRegistered?: boolean;
    commandsRegistered?: boolean;
    events?: {
        client?: Collection<keyof RecipleClientEvents, ({ key: string|symbol; once: boolean; }|(() => any))[]>;
        ws?: Collection<keyof GatewayDispatchEvents, ({ key: string|symbol; once: boolean; }|(() => any))[]>;
        rest?: Collection<keyof RestEvents, ({ key: string|symbol; once: boolean; }|(() => any))[]>;
        moduleManager?: Collection<keyof ModuleManagerEvents, ({ key: string|symbol; once: boolean; }|(() => any))[]>;
        process?: Collection<keyof ProcessEventMap, ({ key: string|symbol; once: boolean; }|(() => any))[]>;
    };
}

export interface ProcessEventMap extends Record<NodeJS.Signals, [signal: NodeJS.Signals]> {
    beforeExit: [code: number];
    disconnect: [];
    exit: [code: number];
    rejectionHandled: [promise: Promise<unknown>];
    uncaughtException: [error: Error, origin: NodeJS.UncaughtExceptionOrigin];
    uncaughtExceptionMonitor: [error: Error, origin: NodeJS.UncaughtExceptionOrigin];
    unhandledRejection: [reason: unknown, promise: Promise<unknown>];
    warning: [warning: Error];
    message: [message: unknown, sendHandle: unknown]; multipleResolves: [type: NodeJS.MultipleResolveType, promise: Promise<unknown>, value: unknown];
    worker: [listener: NodeJS.WorkerListener];
}
