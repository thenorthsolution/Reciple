import { writeFile } from 'fs/promises';
import { runScript } from './helpers.js';
import path from 'path';

export type AddonModuleType = 'cjs'|'cts'|'mjs'|'mts';

export const addonCreators = {
    'reciple-interaction-events': addRecipleInteractionEvents,
    'reciple-anticrash': addRecipleAnticrash,
    'reciple-dev-commands': addRecipleDevCommands,
    'reciple-registry-cache': addRecipleRegistryCache
};

export function createAddonModuleFileContent(pkg: string, imports: string[]|string, classExport: string, type: AddonModuleType, params?: string): string {
    let importStatement: string;
    let exportStatement: string;

    if (type === 'cjs') {
        importStatement = `const ${typeof imports === 'string' ? imports : ('{ ' + imports.join(', ') + ' }')} = require('${pkg}');`;
        exportStatement = `module.exports = new ${classExport}(${params ?? ''});`;
    } else {
        importStatement = `import ${typeof imports === 'string' ? imports : ('{ ' + imports.join(', ') + ' }')} from '${pkg}';`;
        exportStatement = `export default new ${classExport}(${params ?? ''});`;
    }

    return importStatement + '\n\n' + exportStatement;
}

export async function addRecipleInteractionEvents(dir: string, type: AddonModuleType): Promise<void> {
    await writeFile(
        path.join(dir, type.endsWith('js') ? 'modules' : 'src', `RecipleInteractionEvents.${type}`),
        createAddonModuleFileContent('reciple-interaction-events', ['InteractionEventManager'], 'InteractionEventManager', type)
    );
}

export async function addRecipleAnticrash(dir: string, type: AddonModuleType): Promise<void> {
    await writeFile(
        path.join(dir, type.endsWith('js') ? 'modules' : 'src', `RecipleAnticrash.${type}`),
        createAddonModuleFileContent('reciple-anticrash', ['RecipleAnticrash'], 'RecipleAnticrash', type)
    );
}

export async function addRecipleDevCommands(dir: string, type: AddonModuleType): Promise<void> {
    await writeFile(
        path.join(dir, type.endsWith('js') ? 'modules' : 'src', `RecipleDevCommands.${type}`),
        createAddonModuleFileContent('reciple-dev-commands', ['DevCommandManager'], 'DevCommandManager', type, `{\n    devGuilds: [],\n    devUsers: []\n}`)
    );
}

export async function addRecipleRegistryCache(dir: string, type: AddonModuleType): Promise<void> {
    await writeFile(
        path.join(dir, type.endsWith('js') ? 'modules' : 'src', `RecipleRegistryCache.${type}`),
        createAddonModuleFileContent('reciple-registry-cache', ['RegistryCacheManager'], 'RegistryCacheManager', type)
    );
}

export async function installAddons(dir: string, type: AddonModuleType, addons: string[], installPackage?: string): Promise<void> {
    await runScript((installPackage ?? 'npm i') + ' ' + addons.map(a => a + '@2').join(' '), dir);

    for (const addon of addons) {
        await addonCreators[addon as keyof typeof addonCreators](dir, type);
    }
}

export default addonCreators;
