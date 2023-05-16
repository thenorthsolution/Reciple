import { RecipleModuleScript } from '../../../classes/RecipleModule';
import { commandResolvablePredicate } from '../commands/predicates';
import { recipleModuleVersionsPredicate } from './predicates';
import { s } from '@sapphire/shapeshift';

export function validateModuleScriptVersions(versions: unknown): asserts versions is RecipleModuleScript['versions'] {
    recipleModuleVersionsPredicate.parse(versions);
}

export function validateModuleScriptCommands(commands: unknown): asserts commands is RecipleModuleScript['commands'] {
    commandResolvablePredicate.array.optional.parse(commands);
}

export function validateModuleOnStart(onStart: unknown): asserts onStart is RecipleModuleScript['onLoad'] {
    s.instance(Function).parse(onStart);
}

export function validateModuleOnLoad(onLoad: unknown): asserts onLoad is RecipleModuleScript['onLoad'] {
    s.instance(Function).optional.parse(onLoad);
}

export function validateModuleOnUnload(onUnload: unknown): asserts onUnload is RecipleModuleScript['onLoad'] {
    s.instance(Function).optional.parse(onUnload);
}

export function validateModuleScript(moduleScript: unknown): asserts moduleScript is RecipleModuleScript {
    const script = moduleScript as Partial<RecipleModuleScript>;

    validateModuleScriptVersions(script?.versions)
    validateModuleScriptCommands(script.commands);
    validateModuleOnStart(script.onStart);
    validateModuleOnLoad(script?.onLoad);
    validateModuleOnUnload(script?.onUnload);
}
