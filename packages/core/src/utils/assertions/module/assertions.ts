import { RecipleModuleScript } from '../../../classes/RecipleModule';
import { RecipleModuleAssertions } from '../../../classes/assertions/RecipleModuleAssertions';

// TODO: Remove this file

/**
 * @deprecated Use `RecipleModuleAssertions` static methods instead
 */
export function validateModuleScriptVersions(versions: unknown): asserts versions is RecipleModuleScript['versions'] {
    RecipleModuleAssertions.validateModuleScriptVersions(versions);
}

/**
 * @deprecated Use `RecipleModuleAssertions` static methods instead
 */
export function validateModuleOnStart(onStart: unknown): asserts onStart is RecipleModuleScript['onLoad'] {
    RecipleModuleAssertions.validateModuleOnStart(onStart);
}

/**
 * @deprecated Use `RecipleModuleAssertions` static methods instead
 */
export function validateModuleOnLoad(onLoad: unknown): asserts onLoad is RecipleModuleScript['onLoad'] {
    RecipleModuleAssertions.validateModuleOnLoad(onLoad);
}

/**
 * @deprecated Use `RecipleModuleAssertions` static methods instead
 */
export function validateModuleOnUnload(onUnload: unknown): asserts onUnload is RecipleModuleScript['onLoad'] {
    RecipleModuleAssertions.validateModuleOnUnload(onUnload);
}

/**
 * @deprecated Use `RecipleModuleAssertions` static methods instead
 */
export function validateModuleContextMenuCommandPrecondition(precondition: unknown): asserts precondition is RecipleModuleScript['contextMenuCommandPrecondition'] {
    RecipleModuleAssertions.validateModuleContextMenuCommandPrecondition(precondition);
}

/**
 * @deprecated Use `RecipleModuleAssertions` static methods instead
 */
export function validateModuleMessageCommandPrecondition(precondition: unknown): asserts precondition is RecipleModuleScript['messageCommandPrecondition'] {
    RecipleModuleAssertions.validateModuleMessageCommandPrecondition(precondition);
}

/**
 * @deprecated Use `RecipleModuleAssertions` static methods instead
 */
export function validateModuleSlashCommandPrecondition(precondition: unknown): asserts precondition is RecipleModuleScript['slashCommandPrecondition'] {
    RecipleModuleAssertions.validateModuleSlashCommandPrecondition(precondition);
}

/**
 * @deprecated Use `RecipleModuleAssertions` static methods instead
 */
export function validateModuleScript(moduleScript: unknown): asserts moduleScript is RecipleModuleScript {
    RecipleModuleAssertions.validateModuleScript(moduleScript);
}
