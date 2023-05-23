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

`@reciple/update-checker` checks for an update for a given package name from npm registry

## Usage

```js
import { checkLatestUpdate } from '@reciple/update-checker';

checkLatestUpdate('reciple', '0.0.0')
    .then(data => console.log(`An update is available! ${data.currentVersion} => ${data.updatedVersion}`))
    .catch(() => {});
```
