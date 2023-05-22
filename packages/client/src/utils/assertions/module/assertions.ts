import { RecipleModuleScript } from '../../../classes/RecipleModule';
import { recipleModuleVersionsPredicate } from './predicates';
import { s } from '@sapphire/shapeshift';

export function validateModuleScriptVersions(versions: unknown): asserts versions is RecipleModuleScript['versions'] {
    recipleModuleVersionsPredicate.parse(versions);
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

export function validateModuleContextMenuCommandPrecondition(precondition: unknown): asserts precondition is RecipleModuleScript['contextMenuCommandPrecondition'] {
    s.instance(Function).optional.parse(precondition);
}

export function validateModuleMessageCommandPrecondition(precondition: unknown): asserts precondition is RecipleModuleScript['messageCommandPrecondition'] {
    s.instance(Function).optional.parse(precondition);
}

export function validateModuleSlashCommandPrecondition(precondition: unknown): asserts precondition is RecipleModuleScript['slashCommandPrecondition'] {
    s.instance(Function).optional.parse(precondition);
}

export function validateModuleScript(moduleScript: unknown): asserts moduleScript is RecipleModuleScript {
    const script = moduleScript as Partial<RecipleModuleScript>;

    validateModuleScriptVersions(script?.versions)
    s.unknown.array.optional.parse(script?.commands);
    validateModuleOnStart(script.onStart);
    validateModuleOnLoad(script?.onLoad);
    validateModuleOnUnload(script?.onUnload);
    validateModuleContextMenuCommandPrecondition(script?.contextMenuCommandPrecondition);
    validateModuleMessageCommandPrecondition(script?.messageCommandPrecondition);
    validateModuleSlashCommandPrecondition(script?.slashCommandPrecondition);
}
