import { type RecipleModuleData, type RecipleModuleStartData, type RecipleModuleLoadData, type RecipleModuleUnloadData, type RecipleClient } from '@reciple/core';
import { recipleModuleMetadataSymbol } from '../types/constants.js';
import type { RecipleModuleDecoratorMetadata } from '../types/structures.js';

/**
 * Sets a module decorator. Module metadata is stored in the prototype of the class with the symbol `recipleModuleMetadataSymbol`.
 * 
 * ```ts
 * ＠setRecipleModule()
 * class MyModule implements RecipleModuleData {
 *     async onStart(){
 *         return true;
 *     }
 * }
 * ```
 */
export function setRecipleModule(versions?: string|string[]): ClassDecorator
export function setRecipleModule(options?: Partial<Pick<RecipleModuleData, 'versions'|'id'|'name'>>): ClassDecorator
export function setRecipleModule(data?: string|string[]|Partial<Pick<RecipleModuleData, 'versions'|'id'|'name'>>): ClassDecorator {
    return function(target: any) {
        data = typeof data === 'string'
            ? { versions: [data] }
            : Array.isArray(data)
                ? { versions: data }
                : data ?? {};

        target.prototype[recipleModuleMetadataSymbol] = {
            id: data.id,
            name: data.name,
            versions: data.versions,
            commands: [],
            commandsRegistered: false,
            eventsRegistered: false,
            events: {},
            ...target.prototype[recipleModuleMetadataSymbol],
        } satisfies RecipleModuleDecoratorMetadata;

        if (data.versions && data.versions.length) {
            target.prototype.versions ??= [];
            if (typeof target.prototype.versions === 'string') target.prototype.versions = [target.prototype.versions];
            target.prototype.versions.push(...data.versions);
        }

        if (data.id) target.prototype.id ??= data.id;
        if (data.name) target.prototype.name ??= data.name;
    }
}

/**
 * Sets the start function of the module. This decorator must be used on the `onStart` method. The commands and versions will be added to the module when the module is started.
 * 
 * ```ts
 * ＠setRecipleModule()
 * class MyModule implements RecipleModuleData {
 *     ＠setRecipleModuleStart()
 *     async onStart() {
 *         return true;
 *     }
 * }
 * ```
 */
export function setRecipleModuleStart(registerEvents?: boolean) {
    return function<T extends RecipleModuleData['onStart']>(target: unknown, propertyKey: string|symbol, descriptor: TypedPropertyDescriptor<T>) {
        if (!descriptor) throw new Error(`@setRecipleModuleStart must be used on a method`);
        if (propertyKey !== 'onStart') throw new Error(`@setRecipleModuleStart must be used on the onStart method`);

        const originalValue = descriptor.value;

        descriptor.value = async function(this: RecipleModuleData & { [recipleModuleMetadataSymbol]?: RecipleModuleDecoratorMetadata; }, ...args: [data: RecipleModuleStartData]) {
            const metadata = this[recipleModuleMetadataSymbol];

            if (metadata?.commands && !metadata.commandsRegistered) {
                this.commands ??= [];

                for (const command of metadata.commands) {
                    const originalExecute = command.execute as (data: unknown) => void;
                    if (originalExecute) command.setExecute((args: any) => originalExecute.call(this, args));

                    this.commands.push(command);
                }

                metadata.commandsRegistered = true;
            }

            if (metadata?.versions) {
                this.versions ??= [];

                if (typeof this.versions === 'string') this.versions = [this.versions];
                this.versions.push(...(typeof metadata.versions === 'string' ? [metadata.versions] : metadata.versions));
            }

            if (registerEvents && metadata?.events) loadModuleEvents.call(this, metadata, args[0].client);

            return originalValue?.call(this, ...args);
        } as T;
    }
}

/**
 * Sets the load function of the module. This decorator must be used on the `onLoad` method. The events listeners will be added to its event emitter when the module is loaded.
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
 * }
 * ```
 */
export function setRecipleModuleLoad(registerEvents: boolean = true) {
    return function<T extends Exclude<RecipleModuleData['onLoad'], undefined>>(target: unknown, propertyKey: string|symbol, descriptor: TypedPropertyDescriptor<T>) {
        if (!descriptor) throw new Error(`@setRecipleModuleLoad must be used on a method`);
        if (propertyKey !== 'onLoad') throw new Error(`@setRecipleModuleLoad must be used on the onLoad method`);

        const originalValue = descriptor.value;

        descriptor.value = async function(this: RecipleModuleData & { [recipleModuleMetadataSymbol]?: RecipleModuleDecoratorMetadata; }, ...args: [data: RecipleModuleLoadData]) {
            const metadata = this[recipleModuleMetadataSymbol];
            const client = args[0].client;

            if (registerEvents && metadata?.events) loadModuleEvents.call(this, metadata, client);

            return originalValue?.call(this, ...args);
        } as T;
    }
}

/**
 * Sets the unload function of the module. This decorator must be used on the `onUnload` method. The events listeners will be removed from its event emitter when the module is unloaded.
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
 * }
 * ```
 */
export function setRecipleModuleUnload() {
    return function<T extends Exclude<RecipleModuleData['onUnload'], undefined>>(target: unknown, propertyKey: string|symbol, descriptor: TypedPropertyDescriptor<T>) {
        if (!descriptor) throw new Error(`@setRecipleModuleUnload must be used on a method`);
        if (propertyKey !== 'onUnload') throw new Error(`@setRecipleModuleUnload must be used on the onUnload method`);

        const originalValue = descriptor.value;

        descriptor.value = async function(this: RecipleModuleData & { [recipleModuleMetadataSymbol]?: RecipleModuleDecoratorMetadata; }, ...args: [data: RecipleModuleUnloadData]) {
            const metadata = this[recipleModuleMetadataSymbol];
            const client = args[0].client;

            if (metadata) unloadModuleEvents.call(this, metadata, client);

            return originalValue?.call(this, ...args);
        } as T;
    }
}

function loadModuleEvents(this: RecipleModuleData, metadata: RecipleModuleDecoratorMetadata, client: RecipleClient) {
    if (!metadata?.events || !Object.keys(metadata?.events).length || metadata.eventsRegistered) return;

    emitterLoop: for (const [emitter, events] of Object.entries(metadata.events)) {
        let eventEmitter: Record<'on'|'once', (event: any, listener: (...args: any[]) => any) => any>;
        const event = emitter as keyof Exclude<RecipleModuleDecoratorMetadata['events'], undefined>;

        switch (event) {
            case 'client': eventEmitter = client; break;
            case 'ws': eventEmitter = client.ws; break;
            case 'rest': eventEmitter = client.rest; break;
            case 'moduleManager': eventEmitter = client.modules; break;
            case 'process': eventEmitter = process; break;
            default: continue emitterLoop;
        }

        for (const [event, listeners] of events) {
            listenerLoop: for (const listener of listeners) {
                if (typeof listener === 'function') continue listenerLoop;

                const index = listeners.indexOf(listener);
                const listenerFunction = (...args: any[]) => (this[listener.key as never] as (...args: any[]) => any).call(this, ...args);

                if (listener.once !== true) {
                    eventEmitter.on(event, listenerFunction);
                } else {
                    eventEmitter.once(event, listenerFunction);
                }

                listeners.push(listenerFunction);
                if (index !== -1) listeners.splice(index, 1);
            }
        }
    }

    metadata.eventsRegistered = true;
}

function unloadModuleEvents(metadata: RecipleModuleDecoratorMetadata, client: RecipleClient) {
    if (!metadata?.events || !Object.keys(metadata?.events).length || !metadata.eventsRegistered) return;

    emitterLoop: for (const [emitter, events] of Object.entries(metadata.events)) {
        let eventEmitter: Record<'off', (event: any, listener: () => any) => any>;
        const event = emitter as keyof Exclude<RecipleModuleDecoratorMetadata['events'], undefined>;

        switch (event) {
            case 'client': eventEmitter = client; break;
            case 'ws': eventEmitter = client.ws; break;
            case 'rest': eventEmitter = client.rest; break;
            case 'moduleManager': eventEmitter = client.modules; break;
            case 'process': eventEmitter = process; break;
            default: continue emitterLoop;
        }

        for (const [event, listeners] of events) {
            listenerLoop: for (const listener of listeners) {
                if (typeof listener !== 'function') continue listenerLoop;

                const index = listeners.indexOf(listener);
                listeners.splice(index, 1);
                eventEmitter.off(event, listener);
            }
        }
    }

    metadata.eventsRegistered = false;
}
