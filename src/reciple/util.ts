export function isClass<T extends any>(object: any): object is T  {
    const isCtorClass = object.constructor && object.constructor.toString().substring(0, 5) === 'class';
    if(object.prototype === undefined) return isCtorClass;

    const isPrototypeCtorClass = object.prototype.constructor && object.prototype.constructor.toString && object.prototype.constructor.toString().substring(0, 5) === 'class';
    return isCtorClass || isPrototypeCtorClass;
}
