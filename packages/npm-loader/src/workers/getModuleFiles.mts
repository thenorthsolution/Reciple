import { parentPort, workerData } from 'node:worker_threads';
import { RecipleNPMLoader, WorkerData, WorkerScannedFolderData } from '../module.mjs';
import path from 'node:path';

if (!parentPort) process.exit();

const data = workerData as WorkerData;
const scanned: WorkerScannedFolderData[] = [];

for (const folder of data.folders) {
    const isValid = await RecipleNPMLoader.isValidModuleFolder(folder, {
        dependencies: data.dependencies,
        ignoredPackages: data.ignoredPackages
    });

    if (!isValid) {
        scanned.push({
            folder,
            moduleFile: null,
            valid: false
        });

        continue;
    }

    const packageJson = await RecipleNPMLoader.getPackageJson(path.join(folder, 'package.json'), true);
    const moduleFile: string = path.join(folder, packageJson.recipleModule);

    scanned.push({
        folder,
        moduleFile,
        valid: true
    });
}

parentPort.postMessage(scanned);
