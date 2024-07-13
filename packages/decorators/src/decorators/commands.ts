import { ContextMenuCommandBuilder, type ContextMenuCommandExecuteFunction, type ContextMenuCommandBuilderData, type ContextMenuCommandResolvable, type MessageCommandExecuteFunction, MessageCommandBuilder, type MessageCommandBuilderData, type MessageCommandResolvable, type SlashCommandExecuteFunction, type AnySlashCommandBuilder, type SlashCommandBuilderData, type SlashCommandResolvable, SlashCommandBuilder } from '@reciple/core';
import { recipleModuleMetadataSymbol } from '../types/constants.js';
import type { RecipleModuleDecoratorMetadata } from '../types/structures.js';

/**
 * Sets a context menu command decorator.
 * 
 * ```
 * ＠setRecipleModule()
 * class MyModule implements RecipleModuleData {
 *     ＠setRecipleModuleStart()
 *     async onStart() {
 *         return true;
 *     }
 *
 *     ＠setContextMenuCommand({ name: 'Test', type: 'Message' })
 *     async handleContextMenuExecute(data: ContextMenuCommandExecuteData) {
 *         await data.interaction('Test');
 *     }
 * }
 * ```
 * @param data The data for the context menu command.
 * @returns The decorator function.
 */
export function setContextMenuCommand<T extends ContextMenuCommandExecuteFunction>(data: Omit<ContextMenuCommandBuilder, 'execute'|'setExecute'>|Omit<ContextMenuCommandBuilderData, 'execute'|'command_type'>) {
    return function(target: { constructor: { prototype: { [recipleModuleMetadataSymbol]?: RecipleModuleDecoratorMetadata; }; }; }, propertyKey: string|symbol, descriptor?: TypedPropertyDescriptor<T>) {
        if (!descriptor) throw new Error(`@setContextMenuCommand must be used on a method`);

        const value = descriptor?.value;
        const builder = ContextMenuCommandBuilder.resolve(data as ContextMenuCommandResolvable);

        builder.setExecute(data => value!(data));

        if (!target.constructor.prototype[recipleModuleMetadataSymbol]) target.constructor.prototype[recipleModuleMetadataSymbol] = {
            commands: [],
            versions: []
        };

        target.constructor.prototype[recipleModuleMetadataSymbol].commands ??= [];
        target.constructor.prototype[recipleModuleMetadataSymbol].commands.push(builder);
    }
}


/**
 * Sets a message command decorator.
 * 
 * ```ts
 * ＠setRecipleModule()
 * class MyModule implements RecipleModuleData {
 *     ＠setRecipleModuleStart()
 *     async onStart() {
 *         return true;
 *     }
 *
 *     ＠setMessageCommand({ name: 'test', description: 'test command', aliases: ['t'] })
 *     async handleMessageCommandExecute(data: MessageCommandExecuteData) {
 *         await data.message('Test');
 *     }
 * }
 * ```
 * @param data The data for the message command.
 * @returns The decorator function.
 */
export function setMessageCommand<T extends MessageCommandExecuteFunction>(data: Omit<MessageCommandBuilder, 'execute'|'setExecute'>|Omit<MessageCommandBuilderData, 'execute'|'command_type'>) {
    return function(target: { constructor: { prototype: { [recipleModuleMetadataSymbol]?: RecipleModuleDecoratorMetadata; }; }; }, propertyKey: string|symbol, descriptor?: TypedPropertyDescriptor<T>) {
        if (!descriptor) throw new Error(`@setMessageCommand must be used on a method`);

        const value = descriptor?.value;
        const builder = MessageCommandBuilder.resolve(data as MessageCommandResolvable);

        builder.setExecute(data => value!(data));

        if (!target.constructor.prototype[recipleModuleMetadataSymbol]) target.constructor.prototype[recipleModuleMetadataSymbol] = {
            commands: [],
            versions: []
        };

        target.constructor.prototype[recipleModuleMetadataSymbol].commands ??= [];
        target.constructor.prototype[recipleModuleMetadataSymbol].commands.push(builder);
    }
}

/**
 * Sets a slash command decorator.
 * 
 * ```
 * ＠setRecipleModule()
 * class MyModule implements RecipleModuleData {
 *     ＠setRecipleModuleStart()
 *     async onStart() {
 *         return true;
 *     }
 *
 *     ＠setSlashCommand({ name: 'Test', description: 'Test command' })
 *     async handleSlashCommandExecute(data: SlashCommandExecuteData) {
 *         await data.interaction('Test');
 *     }
 * }
 * ```
 * @param data The data for the slash command.
 * @returns The decorator function.
 */
export function setSlashCommand<T extends SlashCommandExecuteFunction>(data: Omit<AnySlashCommandBuilder, 'execute'|'setExecute'>|Omit<SlashCommandBuilderData, 'execute'|'command_type'>) {
    return function(target: { constructor: { prototype: { [recipleModuleMetadataSymbol]?: RecipleModuleDecoratorMetadata; }; }; }, propertyKey: string|symbol, descriptor?: TypedPropertyDescriptor<T>) {
        if (!descriptor) throw new Error(`@setSlashCommand must be used on a method`);

        const value = descriptor?.value;
        const builder = SlashCommandBuilder.resolve(data as SlashCommandResolvable);

        builder.setExecute(data => value!(data));

        if (!target.constructor.prototype[recipleModuleMetadataSymbol]) target.constructor.prototype[recipleModuleMetadataSymbol] = {
            commands: [],
            versions: []
        };

        target.constructor.prototype[recipleModuleMetadataSymbol].commands ??= [];
        target.constructor.prototype[recipleModuleMetadataSymbol].commands.push(builder);
    }
}
