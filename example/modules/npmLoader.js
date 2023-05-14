// @ts-check
import { RecipleNPMLoader } from '@reciple/npm-loader';
import path from 'path';
import { RecipleClient, cli } from 'reciple';

export class NPMLoader extends RecipleNPMLoader {
    get cwd() { return cli.cwd; }

    /**
     * 
     * @param {RecipleClient<false>} client
     */
    async onStart(client) {
        // Change the node_modules path
        this.nodeModulesFolder = path.join(cli.cwd, 'node_modules');
        this.disableVersionChecks = !!client.config.modules?.disableModuleVersionCheck;

        return super.onStart(client);
    }
}

export default new NPMLoader();
