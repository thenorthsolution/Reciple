import { s } from '@sapphire/shapeshift';
import { RecipleModuleScript } from '../classes/RecipleModule';
import { anyCommandBuilderPredicate, anyCommandDataPredicate, stringOrArrayOfStringPredicate } from './predicates';

export function validateModuleScript(moduleScript: unknown): asserts moduleScript is RecipleModuleScript {
    const script = moduleScript as RecipleModuleScript;

    stringOrArrayOfStringPredicate.parse(script?.versions);
    s.union(anyCommandBuilderPredicate, anyCommandDataPredicate).optional.array.parse(script?.commands);
    s.instance(Function).parse(script?.onStart);
    s.instance(Function).optional.parse(script?.onLoad);
    s.instance(Function).optional.parse(script?.onUnload);
}
