<h1 align="center">
    <img src="https://i.imgur.com/h0ljJR5.png" width="50%">
    <br>
</h1>

<h3 align="center">
    <a href="https://discord.gg/thenorthsolution">
        <img src="https://img.shields.io/discord/1032785824686817291?color=5865F2&logo=discord&logoColor=white">
    </a>
    <a href="https://npmjs.org/package/reciple">
        <img src="https://img.shields.io/npm/v/reciple?label=npm">
    </a>
    <a href="https://github.com/thenorthsolution/Reciple/tree/main/packages/reciple">
        <img src="https://img.shields.io/npm/dt/reciple?maxAge=3600">
    </a>
    <a href="https://www.codefactor.io/repository/github/thenorthsolution/reciple">
        <img src="https://www.codefactor.io/repository/github/thenorthsolution/reciple/badge">
    </a>
    <br>
    <div style="padding-top: 1rem">
        <a href="https://discord.gg/thenorthsolution">
            <img src="http://invidget.switchblade.xyz/thenorthsolution">
        </a>
    </div>
</h3>

---

## About

Reciple is a Discord.js command handler framework that provides extended features for developers.

## Installation

```bash
npm create reciple@latest
```

## Packages

- [@reciple/actions](./packages/actions/) - Used by our github workflow to generate docs.json
- [@reciple/core](./packages/core/) - Extends [discord.js](https://npmjs.com/package/discord.js) Client to simplify working with Discord API
- [@reciple/docgen](./packages/docgen/) - Parses Typescript file to generate json file for documentation
- [@reciple/option-resolvers](./packages/option-resolvers/) - A library of built-in message command utilities for Reciple.
- [@reciple/utils](./packages/utils) - Global utilities used by reciple packages
- [create-reciple](./packages/create-reciple/) - A tool used to easily create Reciple projects
- [reciple](./packages/reciple/) - A CLI tool for loading modules and running Reciple based Discord bots
