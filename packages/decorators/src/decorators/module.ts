import { type RecipleModuleData, type RecipleModuleStartData, type RecipleModuleLoadData, type RecipleModuleUnloadData } from '@reciple/core';
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
export function setRecipleModuleStart() {
    return function<T extends RecipleModuleData['onStart']>(target: unknown, propertyKey: string|symbol, descriptor: TypedPropertyDescriptor<T>) {
        if (!descriptor) throw new Error(`@setRecipleModuleStart must be used on a method`);
        if (propertyKey !== 'onStart') throw new Error(`@setRecipleModuleStart must be used on the onStart method`);

        const originalValue = descriptor.value;

        descriptor.value = async function(this: RecipleModuleData & { [recipleModuleMetadataSymbol]?: RecipleModuleDecoratorMetadata; }, ...args: [data: RecipleModuleStartData]) {
            const metadata = this[recipleModuleMetadataSymbol];

            if (metadata?.commands) {
                this.commands ??= [];

                for (const command of metadata.commands) {
                    this.commands.push(command);
                }
            }

            if (metadata?.versions) {
                this.versions ??= [];

                if (typeof this.versions === 'string') this.versions = [this.versions];
                this.versions.push(...(typeof metadata.versions === 'string' ? [metadata.versions] : metadata.versions));
            }

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
export function setRecipleModuleLoad() {
    return function<T extends Exclude<RecipleModuleData['onLoad'], undefined>>(target: unknown, propertyKey: string|symbol, descriptor: TypedPropertyDescriptor<T>) {
        if (!descriptor) throw new Error(`@setRecipleModuleLoad must be used on a method`);
        if (propertyKey !== 'onLoad') throw new Error(`@setRecipleModuleLoad must be used on the onLoad method`);

        const originalValue = descriptor.value;

        descriptor.value = async function(this: RecipleModuleData & { [recipleModuleMetadataSymbol]?: RecipleModuleDecoratorMetadata; }, ...args: [data: RecipleModuleLoadData]) {
            const metadata = this[recipleModuleMetadataSymbol];
            const client = args[0].client;

            if (metadata?.events && Object.keys(metadata?.events).length) {
                emitterLoop: for (const [emitter, events] of Object.entries(metadata.events)) {
                    let eventEmitter: Record<'on'|'once', (event: any, listener: (...args: any[]) => any) => any>;

                    switch (emitter) {
                        case 'client': eventEmitter = client; break;
                        case 'ws': eventEmitter = client.ws; break;
                        case 'rest': eventEmitter = client.rest; break;
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
            }

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

            if (metadata?.events && Object.keys(metadata?.events).length) {
                emitterLoop: for (const [emitter, events] of Object.entries(metadata.events)) {
                    let eventEmitter: Record<'off', (event: any, listener: () => any) => any>;

                    switch (emitter) {
                        case 'client': eventEmitter = client; break;
                        case 'ws': eventEmitter = client.ws; break;
                        case 'rest': eventEmitter = client.rest; break;
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
            }

            return originalValue?.call(this, ...args);
        } as T;
    }
}
