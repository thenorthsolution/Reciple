import { RecipleNPMLoader } from '@reciple/npm-loader';
import path from 'path';

export default new RecipleNPMLoader({
    nodeModulesFolder: path.join(process.cwd(), '../node_modules'),
    // foldersPerWorker: 500
});
