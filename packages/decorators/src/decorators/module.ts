import { type AnyCommandResolvable, type RecipleClientEvents, type RecipleModuleData, type RecipleModuleStartData, type RecipleModuleLoadData, type RecipleModuleUnloadData } from '@reciple/core';
import type { Collection, GatewayDispatchEvents, RestEvents } from 'discord.js';
import { recipleModuleMetadataSymbol } from '../types/constants.js';

export interface RecipleModuleDecoratorMetadata {
    commands?: AnyCommandResolvable[];
    versions?: string|string[];
    events?: {
        client?: Collection<keyof RecipleClientEvents, ({ key: string|symbol; once: boolean; }|(() => any))[]>;
        ws?: Collection<keyof GatewayDispatchEvents, ({ key: string|symbol; once: boolean; }|(() => any))[]>;
        rest?: Collection<keyof RestEvents, ({ key: string|symbol; once: boolean; }|(() => any))[]>;
    };
}

export function setRecipleModule(versions?: string|string[]) {
    return function(target: any) {
        target.prototype[recipleModuleMetadataSymbol] = {
            commands: [],
            ...target.prototype[recipleModuleMetadataSymbol],
            versions,
        } satisfies RecipleModuleDecoratorMetadata;

        if (!versions) return;

        target.prototype.versions ??= [];
        if (typeof target.prototype.versions === 'string') target.prototype.versions = [target.prototype.versions];
        target.prototype.versions.push(...(typeof versions === 'string' ? [versions] : versions));
    }
}

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
