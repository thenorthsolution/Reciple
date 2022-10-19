import { AnyCommandBuilder, CommandBuilderType } from './types/builders';

/**
 * Check if an object is a class
 * @param object Object to identify
 */
export function isClass<T = any>(object: any): object is T {
    const isClassConstructor = object.constructor && object.constructor.toString().substring(0, 5) === 'class';
    if (object.prototype === undefined) return isClassConstructor;

    const isPrototypeClassConstructor = object.prototype.constructor && object.prototype.constructor.toString && object.prototype.constructor.toString().substring(0, 5) === 'class';
    return isClassConstructor || isPrototypeClassConstructor;
}

/**
 * Emit process warning about deprecated method/function
 * @param content Warning content
 */
export function deprecationWarning(content: string | Error): void {
    process.emitWarning(content, 'DeprecationWarning');
}

export function validateCommandBuilder(command: AnyCommandBuilder): boolean {
    if (!command.name) return false;
    if (command.type === CommandBuilderType.MessageCommand && command.options.length && command.options.some(o => !o.name)) return false;

    return true;
}
