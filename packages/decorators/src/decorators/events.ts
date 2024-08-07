import { type ModuleManagerEvents, type RecipleClientEvents } from '@reciple/core';
import { Collection, GatewayDispatchEvents, type RestEvents } from 'discord.js';
import type { ProcessEventMap, RecipleModuleDecoratorMetadata, TypedMethodDecorator } from '../types/structures.js';
import { recipleModuleMetadataSymbol } from '../types/constants.js';

/**
 * Sets a client event
 * 
 * ```ts
 * ＠setRecipleModule()
 * class MyModule implements RecipleModuleData {
 *     ＠setRecipleModuleStart()
 *     async onStart() {
 *         return true;
 *     }
 * 
 *     ＠setRecipleModuleLoad()
 *     async onLoad() {}
 * 
 *     ＠setRecipleModuleUnload()
 *     async onUnload() {}
 *
 *     ＠setClientEvent('messageCreate')
 *     async handleMessageEvent(message: Message) {
 *         await message.reply('Test');
 *     }
 * }
 * ```
 * @param event The event name
 * @param once True if the event should only be triggered once
 */
export function setClientEvent<E extends keyof RecipleClientEvents, A extends RecipleClientEvents[E]>(event: E, once?: boolean): TypedMethodDecorator<(...args: A) => any>;
export function setClientEvent<E extends string|symbol, A extends any[]>(event: E, once?: boolean): TypedMethodDecorator<(...args: A) => any>;
export function setClientEvent<E extends string|symbol, A extends any[]>(event: E, once?: boolean): TypedMethodDecorator<(...args: A) => any> {
    return function(target: { constructor: { prototype: { [recipleModuleMetadataSymbol]?: RecipleModuleDecoratorMetadata; }; }; }, propertyKey: string|symbol, descriptor: TypedPropertyDescriptor<(...args: A) => any>) {
        if (!descriptor) throw new Error(`@setClientEvent must be used on a method`);

        const emitter = 'client' as const;
        const metadata = target.constructor.prototype[recipleModuleMetadataSymbol] ??= {};

        target.constructor.prototype[recipleModuleMetadataSymbol] = setEventMetadata(metadata, propertyKey, emitter, event, once);
    }
}

/**
 * Sets a websocket event
 * 
 * ```ts
 * ＠setRecipleModule()
 * class MyModule implements RecipleModuleData {
 *     ＠setRecipleModuleStart()
 *     async onStart() {
 *         return true;
 *     }
 * 
 *     ＠setRecipleModuleLoad()
 *     async onLoad() {}
 * 
 *     ＠setRecipleModuleUnload()
 *     async onUnload() {}
 *
 *     ＠setWebsocketEvent(GatewayDispatchEvents.MessageCreate)
 *     async handleWebsocketEvent(data: any, shardId: number) {
 *         console.log(data);
 *     }
 * }
 * ```
 * @param event The event name
 * @param once True if the event should only be triggered once
 */
export function setWebsocketEvent<E extends keyof GatewayDispatchEvents, A extends [data: any, shardId: number]>(event: E, once?: boolean): TypedMethodDecorator<(...args: A) => any>;
export function setWebsocketEvent<E extends string|symbol, A extends any[]>(event: E, once?: boolean): TypedMethodDecorator<(...args: A) => any>;
export function setWebsocketEvent<E extends string|symbol, A extends any[]>(event: E, once?: boolean): TypedMethodDecorator<(...args: A) => any> {
    return function(target: { constructor: { prototype: { [recipleModuleMetadataSymbol]?: RecipleModuleDecoratorMetadata; }; }; }, propertyKey: string|symbol, descriptor: TypedPropertyDescriptor<(...args: A) => any>) {
        if (!descriptor) throw new Error(`@setWsEvent must be used on a method`);

        const emitter = 'ws' as const;
        const metadata = target.constructor.prototype[recipleModuleMetadataSymbol] ??= {};

        target.constructor.prototype[recipleModuleMetadataSymbol] = setEventMetadata(metadata, propertyKey, emitter, event, once);
    }
}

/**
 * Sets a REST event
 * 
 * ```ts
 * ＠setRecipleModule()
 * class MyModule implements RecipleModuleData {
 *     ＠setRecipleModuleStart()
 *     async onStart() {
 *         return true;
 *     }
 * 
 *     ＠setRecipleModuleLoad()
 *     async onLoad() {}
 * 
 *     ＠setRecipleModuleUnload()
 *     async onUnload() {}
 *
 *     ＠setRESTEvent('restDebug')
 *     async handleRESTEvent(info: string) {
 *         console.log(info);
 *     }
 * }
 * ```
 * @param event The event name
 * @param once True if the event should only be triggered once
 */
export function setRESTEvent<E extends keyof RestEvents, A extends RestEvents[E]>(event: E, once?: boolean): TypedMethodDecorator<(...args: A) => any>;
export function setRESTEvent<E extends string|symbol, A extends any[]>(event: E, once?: boolean): TypedMethodDecorator<(...args: A) => any>;
export function setRESTEvent<E extends string|symbol, A extends any[]>(event: E, once?: boolean): TypedMethodDecorator<(...args: A) => any> {
    return function(target: { constructor: { prototype: { [recipleModuleMetadataSymbol]?: RecipleModuleDecoratorMetadata; }; }; }, propertyKey: string|symbol, descriptor: TypedPropertyDescriptor<(...args: A) => any>) {
        if (!descriptor) throw new Error(`@setRestEvent must be used on a method`);

        const emitter = 'rest' as const;
        const metadata = target.constructor.prototype[recipleModuleMetadataSymbol] ??= {};

        target.constructor.prototype[recipleModuleMetadataSymbol] = setEventMetadata(metadata, propertyKey, emitter, event, once);
    }
}

/**
 * Sets a ModuleManager event
 * 
 * ```ts
 * ＠setRecipleModule()
 * class MyModule implements RecipleModuleData {
 *     ＠setRecipleModuleStart()
 *     async onStart() {
 *         return true;
 *     }
 * 
 *     ＠setRecipleModuleLoad()
 *     async onLoad() {}
 * 
 *     ＠setRecipleModuleUnload()
 *     async onUnload() {}
 *
 *     ＠setModuleManagerEvent('resolveModuleFileError')
 *     async handleRESTEvent(file: string, error: Error) {
 *         console.log(file, error);
 *     }
 * }
 * ```
 * @param event The event name
 * @param once True if the event should only be triggered once
 */
export function setModuleManagerEvent<E extends keyof ModuleManagerEvents, A extends ModuleManagerEvents[E]>(event: E, once?: boolean): TypedMethodDecorator<(...args: A) => any>;
export function setModuleManagerEvent<E extends string|symbol, A extends any[]>(event: E, once?: boolean): TypedMethodDecorator<(...args: A) => any>;
export function setModuleManagerEvent<E extends string|symbol, A extends any[]>(event: E, once?: boolean): TypedMethodDecorator<(...args: A) => any> {
    return function(target: { constructor: { prototype: { [recipleModuleMetadataSymbol]?: RecipleModuleDecoratorMetadata; }; }; }, propertyKey: string|symbol, descriptor: TypedPropertyDescriptor<(...args: A) => any>) {
        if (!descriptor) throw new Error(`@setModuleManagerEvent must be used on a method`);

        const emitter = 'moduleManager' as const;
        const metadata = target.constructor.prototype[recipleModuleMetadataSymbol] ??= {};

        target.constructor.prototype[recipleModuleMetadataSymbol] = setEventMetadata(metadata, propertyKey, emitter, event, once);
    }
}

/**
 * Sets a ModuleManager event
 * 
 * ```ts
 * ＠setRecipleModule()
 * class MyModule implements RecipleModuleData {
 *     ＠setRecipleModuleStart()
 *     async onStart() {
 *         return true;
 *     }
 * 
 *     ＠setRecipleModuleLoad()
 *     async onLoad() {}
 * 
 *     ＠setRecipleModuleUnload()
 *     async onUnload() {}
 *
 *     ＠setProcessEvent('uncaughtException')
 *     async handleRESTEvent(error: Error, origin: string) {
 *         console.log(error);
 *     }
 * }
 * ```
 * @param event The event name
 * @param once True if the event should only be triggered once
 */
export function setProcessEvent<E extends keyof ProcessEventMap, A extends ProcessEventMap[E]>(event: E, once?: boolean): TypedMethodDecorator<(...args: A) => any>;
export function setProcessEvent<E extends string|symbol, A extends any[]>(event: E, once?: boolean): TypedMethodDecorator<(...args: A) => any>;
export function setProcessEvent<E extends string|symbol, A extends any[]>(event: E, once?: boolean): TypedMethodDecorator<(...args: A) => any> {
    return function(target: { constructor: { prototype: { [recipleModuleMetadataSymbol]?: RecipleModuleDecoratorMetadata; }; }; }, propertyKey: string|symbol, descriptor: TypedPropertyDescriptor<(...args: A) => any>) {
        if (!descriptor) throw new Error(`@setProcessEvent must be used on a method`);

        const emitter = 'process' as const;
        const metadata = target.constructor.prototype[recipleModuleMetadataSymbol] ??= {};

        target.constructor.prototype[recipleModuleMetadataSymbol] = setEventMetadata(metadata, propertyKey, emitter, event, once);
    }
}

function setEventMetadata(
    metadata: RecipleModuleDecoratorMetadata,
    key: string|symbol,
    emitter: keyof Exclude<RecipleModuleDecoratorMetadata['events'], undefined>,
    event: string|symbol,
    once?: boolean
): RecipleModuleDecoratorMetadata {
    const collection = metadata.events?.[emitter] ?? new Collection<any, ({ key: string|symbol; once: boolean; }|(() => any))[]>();
    const listeners = collection.get(event) ?? [];

    once = !!once;

    if (!listeners.some(l => typeof l !== 'function' && l.key === key && l.once === once)) {
        listeners.push({ key: key, once });
        collection.set(event, listeners);
    }

    if (!metadata.events) metadata.events = {};
    if (!metadata.events[emitter]) metadata.events[emitter] = collection;

    return metadata;
}
