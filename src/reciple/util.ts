export function isClass<T extends any>(object: any): object is T  {
    const isClassConstructor = object.constructor && object.constructor.toString().substring(0, 5) === 'class';
    if(object.prototype === undefined) return isClassConstructor;

    const isPrototypeClassConstructor = object.prototype.constructor && object.prototype.constructor.toString && object.prototype.constructor.toString().substring(0, 5) === 'class';
    return isClassConstructor || isPrototypeClassConstructor;
}
