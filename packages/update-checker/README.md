<h1 align="center">
    <img src="https://i.imgur.com/DWM0tJL.png" width="50%">
    <br>
</h1>

<h3 align="center">
    <a href="https://discord.gg/VzP8qW7Z8d">
        <img src="https://img.shields.io/discord/993105237000855592?color=5865F2&logo=discord&logoColor=white">
    </a>
    <a href="https://npmjs.org/package/reciple">
        <img src="https://img.shields.io/npm/v/reciple?label=npm">
    </a>
    <a href="https://github.com/FalloutStudios/Reciple/blob/main/LICENSE">
        <img src="https://img.shields.io/npm/dt/reciple.svg?maxAge=3600">
    </a>
    <a href="https://www.codefactor.io/repository/github/falloutstudios/reciple/overview/main">
        <img src="https://www.codefactor.io/repository/github/falloutstudios/reciple/badge/main">
    </a>
</h3>

## About

`@reciple/update-checker` checks for an update for a given package name from npm registry

## Usage

```js
import { checkLatestUpdate } from '@reciple/update-checker';

const data = checkLatestUpdate('reciple', '0.0.0').catch(() => null);

if (data?.updateType) console.log(`An update is available! ${data.currentVersion} => ${data.updatedVersion}`);
```