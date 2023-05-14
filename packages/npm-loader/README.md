<h1 align="center">
    <img src="https://i.imgur.com/DWM0tJL.png" width="50%">
    <br>
</h1>

<h3 align="center">
    <a href="https://npmjs.org/package/reciple">
        <img src="https://img.shields.io/npm/v/reciple?label=latest%20npm%20release%20">
    </a>
    <a href="https://github.com/FalloutStudios/Reciple/blob/main/LICENSE">
        <img src="https://img.shields.io/github/license/FalloutStudios/Reciple">
    </a>
    <a href="https://www.codefactor.io/repository/github/falloutstudios/reciple/overview/main">
        <img src="https://www.codefactor.io/repository/github/falloutstudios/reciple/badge/main">
    </a>
</h3>

## About

`@reciple/npm-loader` will load Reciple modules from node_modules

## Usage

```js
import { RecipleNPMLoader } from '@reciple/npm-loader';

export default new RecipleNPMLoader();
```

You can set your custom node_modules folder by extending the class
```js
import { RecipleNPMLoader } from '@reciple/npm-loader';
import path from 'path';

export class NPMLoader extends RecipleNPMLoader {
    async onStart(client) {
        // Change the node_modules path
        this.nodeModulesFolder = path.join(cli.cwd, 'node_modules');
        // Use config value of disableVersionChecks
        this.disableVersionChecks = !!client.config.modules?.disableModuleVersionCheck;

        return super.onStart(client);
    }
}

export default new NPMLoader();
```
