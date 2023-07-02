// @ts-check
import { RecipleNPMLoader } from '@reciple/npm-loader';
import { RecipleClient } from 'reciple';
import path from 'path';

export class NPMLoader extends RecipleNPMLoader {
    /**
     * 
     * @param {RecipleClient<false>} client
     */
    async onStart(client) {
        // Change the node_modules path
        this.nodeModulesFolder = path.join(this.cwd, 'node_modules');

        // Use config value of disableVersionChecks
        this.disableVersionChecks = !!client.config.modules?.disableModuleVersionCheck;

        // Ignored packages
        this.ignoredPackages = [];

        // Define to only use modules that are in package.json dependencies and dev dependencies
        // this.packageJsonPath = path.join(this.cwd, 'package.json');

        return super.onStart(client);
    }
}

export default new NPMLoader();
