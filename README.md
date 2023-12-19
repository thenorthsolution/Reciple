<h1 align="center">
    <img src="https://i.imgur.com/DWM0tJL.png" width="50%">
    <br>
</h1>

<h3 align="center">
    <a href="https://discord.ggthenorthsolution1">
        <img src="https://img.shields.io/discord/1032785824686817291?color=5865F2&logo=discord&logoColor=white">
    </a>
    <a href="https://npmjs.org/package/reciple">
        <img src="https://img.shields.io/npm/v/reciple?label=npm">
    </a>
    <a href="https://github.com/thenorthsolution/Reciple/tree/main/packages/reciple">
        <img src="https://img.shields.io/npm/dt/reciple?maxAge=3600">
    </a>
    <a href="https://www.codefactor.io/repository/github/falloutstudios/reciple/overview/main">
        <img src="https://www.codefactor.io/repository/github/falloutstudios/reciple/badge/main">
    </a>
    <br>
    <div style="padding-top: 1rem">
        <a href="https://discord.ggthenorthsolution1">
            <img src="https://discord.com/api/guilds/1032785824686817291/embed.png?style=banner2">
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
- [@reciple/npm-loader](./packages/npm-loader) - A reciple module that loads Reciple modules from node_modules
- [@reciple/update-checker](./packages/update-checker) - Checks for an update for a given package name from npm registry
- [@reciple/utils](./packages/utils) - Global utilities used by reciple packages
- [create-reciple](./packages/create-reciple/) - A tool used to easily create Reciple projects
- [reciple](./packages/reciple/) - A CLI tool for loading modules and running Reciple based Discord bots

<center>
    <h3>Setup with <code>npm create reciple@latest</code></h3>
    <img src="https://i.imgur.com/Sxfczjz.gif" height="150">
</center>
