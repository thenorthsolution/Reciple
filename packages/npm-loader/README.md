<h1 align="center">
    <img src="https://i.imgur.com/DWM0tJL.png" width="50%">
    <br>
</h1>

<h3 align="center">
    <a href="https://discord.gg/kajdev-1032785824686817291">
        <img src="https://img.shields.io/discord/1032785824686817291?color=5865F2&logo=discord&logoColor=white">
    </a>
    <a href="https://npmjs.org/package/@reciple/npm-loader">
        <img src="https://img.shields.io/npm/v/%40reciple/npm-loader?label=npm">
    </a>
    <a href="https://github.com/FalloutStudios/Reciple/tree/main/packages/npm-loader">
        <img src="https://img.shields.io/npm/dt/%40reciple/npm-loader?maxAge=3600">
    </a>
    <a href="https://www.codefactor.io/repository/github/falloutstudios/reciple/overview/main">
        <img src="https://www.codefactor.io/repository/github/falloutstudios/reciple/badge/main">
    </a>
    <br>
    <div style="padding-top: 1rem">
        <a href="https://discord.gg/kajdev-1032785824686817291">
            <img src="https://discord.com/api/guilds/1032785824686817291/embed.png?style=banner2">
        </a>
    </div>
</h3>

---

## About

`@reciple/npm-loader` loads Reciple modules from node_modules

## Usage

```js
import { RecipleNPMLoader } from '@reciple/npm-loader';

export default new RecipleNPMLoader();
```

You can set your custom node_modules folder by extending the class
```js
import { RecipleNPMLoader } from '@reciple/npm-loader';
import path from 'node:path';

export class NPMLoader extends RecipleNPMLoader {
    async onStart(client) {
        // Change the node_modules path
        this.nodeModulesFolder = path.join(process.cwd(), 'node_modules');
        // Use config value of disableVersionChecks
        this.disableVersionChecks = !!client.config.modules?.disableModuleVersionCheck;
        // Ignored packages
        this.ignoredPackages = [];
        // Define to only use modules that are in package.json dependencies and dev dependencies
        this.packageJsonPath = path.join(process.cwd(), 'package.json');

        return super.onStart(client);
    }
}

export default new NPMLoader();
```
