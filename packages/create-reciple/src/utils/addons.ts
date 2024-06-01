import { writeFile } from 'node:fs/promises';
import { runScript } from './helpers.js';
import path from 'node:path';

export type AddonModuleType = 'js'|'ts';

export const addonCreators = {
    'reciple-interaction-events': addRecipleInteractionEvents,
    'reciple-anticrash': addRecipleAnticrash,
    'reciple-dev-commands': addRecipleDevCommands,
    'reciple-registry-cache': addRecipleRegistryCache
};

export function createAddonModuleFileContent(pkg: string, imports: string[]|string, classExport: string, type: AddonModuleType, params?: string): string {
    const importStatement = `import ${typeof imports === 'string' ? imports : ('{ ' + imports.join(', ') + ' }')} from '${pkg}';`;
    const exportStatement = `export default new ${classExport}(${params ?? ''});`;

    return importStatement + '\n\n' + exportStatement;
}

export async function addRecipleInteractionEvents(dir: string, type: AddonModuleType): Promise<void> {
    await writeFile(
        path.join(dir, type === 'js' ? 'modules' : 'src', `RecipleInteractionEvents.${type}`),
        createAddonModuleFileContent('reciple-interaction-events', ['InteractionEventManager'], 'InteractionEventManager', type)
    );
}

export async function addRecipleAnticrash(dir: string, type: AddonModuleType): Promise<void> {
    await writeFile(
        path.join(dir, type === 'js' ? 'modules' : 'src', `RecipleAnticrash.${type}`),
        createAddonModuleFileContent('reciple-anticrash', ['RecipleAnticrash'], 'RecipleAnticrash', type)
    );
}

export async function addRecipleDevCommands(dir: string, type: AddonModuleType): Promise<void> {
    await writeFile(
        path.join(dir, type === 'js' ? 'modules' : 'src', `RecipleDevCommands.${type}`),
        createAddonModuleFileContent('reciple-dev-commands', ['DevCommandManager'], 'DevCommandManager', type, `{\n    devGuilds: [],\n    devUsers: []\n}`)
    );
}

export async function addRecipleRegistryCache(dir: string, type: AddonModuleType): Promise<void> {
    await writeFile(
        path.join(dir, type === 'js' ? 'modules' : 'src', `RecipleRegistryCache.${type}`),
        createAddonModuleFileContent('reciple-registry-cache', ['RegistryCacheManager'], 'RegistryCacheManager', type)
    );
}

export async function installAddons(dir: string, type: AddonModuleType, addons: string[], installPackage?: string): Promise<void> {
    await runScript((installPackage ?? 'npm i') + ' ' + addons.map(a => a + '@3').join(' '), dir);

    for (const addon of addons) {
        await addonCreators[addon as keyof typeof addonCreators](dir, type);
    }
}

export default addonCreators;
