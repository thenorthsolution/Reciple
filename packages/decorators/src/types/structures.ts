import type { AnyCommandResolvable, RecipleClientEvents } from '@reciple/core';
import type { Collection, GatewayDispatchEvents, RestEvents } from 'discord.js';

export type TypedMethodDecorator<T> = (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T> | void;

export interface RecipleModuleDecoratorMetadata {
    commands?: AnyCommandResolvable[];
    versions?: string|string[];
    events?: {
        client?: Collection<keyof RecipleClientEvents, ({ key: string|symbol; once: boolean; }|(() => any))[]>;
        ws?: Collection<keyof GatewayDispatchEvents, ({ key: string|symbol; once: boolean; }|(() => any))[]>;
        rest?: Collection<keyof RestEvents, ({ key: string|symbol; once: boolean; }|(() => any))[]>;
    };
}
