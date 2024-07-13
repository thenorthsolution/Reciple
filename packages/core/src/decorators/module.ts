import type { RecipleModuleData, RecipleModuleStartData } from '../classes/structures/RecipleModule.js';
import type { AnyCommandResolvable } from '../types/structures.js';

export const recipleModuleMetadataSymbol = Symbol('recipleMetadata');

export interface RecipleModuleDecoratorMetadata {
    commands?: AnyCommandResolvable[];
    versions?: string|string[];
}

export function setRecipleModule(versions?: string|string[]) {
    return function(target: any) {
        target.prototype[recipleModuleMetadataSymbol] = {
            commands: [],
            ...target[recipleModuleMetadataSymbol],
            versions,
        } satisfies RecipleModuleDecoratorMetadata;

        if (!versions) return;

        target.prototype.versions ??= [];
        if (typeof target.prototype.versions === 'string') target.prototype.versions = [target.prototype.versions];
        target.prototype.versions.push(...(typeof versions === 'string' ? [versions] : versions));
    }
}

export function setRecipleModuleStart() {
    return function<T extends RecipleModuleData['onStart']>(target: Object, propertyKey: string|symbol, descriptor: TypedPropertyDescriptor<T>) {
        if (!descriptor) throw new Error(`@setRecipleModuleStart must be used on a method`);
        if (propertyKey !== 'onStart') throw new Error(`@setRecipleModuleStart must be used on the onStart method`);

        const originalValue = descriptor.value;

        descriptor.value = async function(this: RecipleModuleData & { [recipleModuleMetadataSymbol]?: RecipleModuleDecoratorMetadata; }, ...args: [data: RecipleModuleStartData]) {
            const metadata = this[recipleModuleMetadataSymbol] ?? { commands: [], versions: [] };

            if (metadata.commands) {
                this.commands ??= [];

                for (const command of metadata.commands) {
                    this.commands.push(command);
                }
            }

            if (metadata.versions) {
                this.versions ??= [];

                if (typeof this.versions === 'string') this.versions = [this.versions];
                this.versions.push(...(typeof metadata.versions === 'string' ? [metadata.versions] : metadata.versions));
            }

            return originalValue?.call(this, ...args);
        } as T;
    }
}
