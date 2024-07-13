import { ContextMenuCommandBuilder, type ContextMenuCommandBuilderData, type ContextMenuCommandExecuteFunction, type ContextMenuCommandResolvable } from '../classes/builders/ContextMenuCommandBuilder.js';
import { MessageCommandBuilder, type MessageCommandBuilderData, type MessageCommandExecuteFunction, type MessageCommandResolvable } from '../classes/builders/MessageCommandBuilder.js';
import { SlashCommandBuilder, type AnySlashCommandBuilder, type SlashCommandBuilderData, type SlashCommandExecuteFunction, type SlashCommandResolvable } from '../classes/builders/SlashCommandBuilder.js';
import { recipleModuleMetadataSymbol } from '../types/constants.js';
import { type RecipleModuleDecoratorMetadata } from './module.js';

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
