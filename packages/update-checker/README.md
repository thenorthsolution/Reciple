<h1 align="center">
    <img src="https://i.imgur.com/DWM0tJL.png" width="50%">
    <br>
</h1>

<h3 align="center">
    <a href="https://discord.gg/kajdev-1032785824686817291">
        <img src="https://img.shields.io/discord/1032785824686817291?color=5865F2&logo=discord&logoColor=white">
    </a>
    <a href="https://npmjs.org/package/@reciple/update-checker">
        <img src="https://img.shields.io/npm/v/%40reciple/update-checker?label=npm">
    </a>
    <a href="https://github.com/FalloutStudios/Reciple/tree/main/packages/update-checker">
        <img src="https://img.shields.io/npm/dt/%40reciple/update-checker?maxAge=3600">
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

`@reciple/update-checker` checks for an update for a given package name from npm registry

## Usage

```js
import { checkLatestUpdate } from '@reciple/update-checker';

const data = checkLatestUpdate('reciple', '0.0.0').catch(() => null);

if (data?.updateType) console.log(`An update is available! ${data.currentVersion} => ${data.updatedVersion}`);
```
