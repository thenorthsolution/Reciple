Reciple / [Exports](modules.md)

<h1 align="center">
    <img src="https://i.imgur.com/8pYGOWW.png" width="50%">
    <br>
    <img alt="Lines of code" src="https://img.shields.io/tokei/lines/github/FalloutStudios/Reciple">
    <img alt="GitHub" src="https://img.shields.io/github/license/FalloutStudios/Reciple">
    <a href="https://www.codefactor.io/repository/github/falloutstudios/reciple/overview/main"><img src="https://www.codefactor.io/repository/github/falloutstudios/reciple/badge/main" alt="CodeFactor"></a>
</h1>

A simple modular Discord bot made with Discord.js written in TypeScript.

## Installation
To install the bot, run the following command:

```bash
npm i reciple
```

You can initialize the bot to the current directory with the following command:

```bash
npx reciple
```

It will ask you to continue if the directory is not empty type `y` to continue after the bot has been initialized it will ask you for your bot token.

> You can always change the token later

## Config

You can configure the bot on `reciple.yml` in the bot root directory.

### Token

You can directly change the token on `reciple.yml` like so:

```yml
token: "YOUR_TOKEN_HERE"
```

Using environment variables is also supported:

```yml
token: "env:TOKEN_VARIABLE"
```

You can override the token on the command line like so:

```bash
npx reciple --token "YOUR_TOKEN_HERE"
```

## Running the bot
To run the bot, run the following command:

```bash
npx reciple
```

> ## Fun Fact
> The name reciple is from a minecraft bug. The bug was a misspelling of the word `recipe`. [View Mojang Bug Report](https://bugs.mojang.com/browse/MC-225837)

# Save the Earth
[#letTheEarthBreathe](https://rebellion.global/)
