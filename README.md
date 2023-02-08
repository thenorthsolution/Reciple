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
    <br>
    A simple Dicord.js handler that just works.
</h3>

# Features

* [CLI based handler](#cli-usage)
* [Supports Context Menus](#context-menus)
* [Supports Prefix/Message commands](#message-commands)
* [Validate messsage command options](#validate-message-command-options)
* [Supports Slash Commands](#slash-commands)
* [Built-in command cooldowns](#command-cooldowns)
* Automatically register application commands
* [Highly configurable](#config)

## Installation

To install the bot, run the following command in your terminal:

```bash
npm i reciple discord.js
```

You can initialize the bot to the current directory with the following command in your terminal:

```bash
npx reciple
```

It will ask you to continue if the directory is not empty. Type `y` to continue. After the bot has been initialized, it will ask you for your bot token.

> You can change the token anytime you want

## CLI usage
```yml
Usage: reciple [options] [cwd]

Reciple.js - Discord.js handler cli

Arguments:
  cwd                    Change the current working directory

Options:
  -v, --version          output the version number
  -t, --token <token>    Replace used bot token
  -c, --config <config>  Change path to config file
  -D, --debugmode        Enable debug mode
  -y, --yes              Agree to all Reciple confirmation prompts
  --env                  .env file location
  -h, --help             display help for command
```

## Message Commands

Reciple provides built-in `MessageCommandBuilder` class that can be used for message command handler.

```js
const { MessageCommandBuilder } = require('reciple');

new MessageCommandBuilder()
    .setName("command")
    .setDescription("Your lil tiny description")
    .addAliases('cmd', 'cmd1')
    .setExecute(command => command.message.reply("Hello!"))
```

### Validate Message Command Options

```js
const { MessageCommandBuilder } = require('reciple');

new MessageCommandBuilder()
    .setName("command")
    .setDescription("Your lil tiny description")
    .addAliases('cmd', 'cmd1')
    .setValidateOptions(true) // Validate options
    .addOption(option => option
        .setName("quantity")
        .setDescription("Must be a number")
        .setRequired(true) // A required option
        .setValidator(val => !isNaN(Number(val))) // Validate value
    )
    .setExecute(async command => {
        const quantity = Number(command.options.getValue('quantity', true));

        await command.message.reply("Quantity: " + quantity);
    })
```

## Context Menus

Reciple provides custom `ContextMenuBuilder` class that can be used for context menu command handler.

```js
const { ContextMenuBuilder } = require('reciple');
const { ApplicationCommandType } = require('discord.js');

new ContextMenuBuilder()
    .setName('Ban')
    .setType(ApplicationCommandType.User)
    .setExecute(async ({ interaction }) => {
        if (!interaction.inCachedGuild()) return;
        await interaction.member.ban();
    })
```

## Slash Commands

Reciple provides custom `SlashCommandBuilder` class that can be used for slash command handler.

```js
const { SlashCommandBuilder } = require('reciple');

new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Pong')
    .setExecute(async ({ interaction }) => interaction.reply(`Pong!`))
```

## Command Cooldowns

```js
const { MessageCommandBuilder, MessageCommandBuilder, SlashCommandBuilder } = require('reciple');
const { ApplicationCommandType } = require('discord.js');

new ContextMenuCommandBuilder()
    .setName('Context Menu')
    .setType(ApplicationCommandType.Message)
    .setCooldown(1000 * 5) // 5 seconds cooldown
    .setExecute(async ({ interaction }) => interaction.reply(`Hello!`));

new ContextMenuCommandBuilder()
    .setName('message-command')
    .setDescription(`Your command`)
    .setCooldown(1000 * 5) // 5 seconds cooldown
    .setExecute(async ({ message }) => message.reply(`Hello!`));

new SlashCommandBuilder()
    .setName('slash-command')
    .setDescription(`Your command`)
    .setCooldown(1000 * 5) // 5 seconds cooldown
    .setExecute(async ({ interaction }) => interaction.reply(`Hello!`));
```

## Config

You can configure the bot in `reciple.yml` located in the bot's root directory.

### Token

You can directly change the token in `reciple.yml`.

```yml
token: "YOUR_TOKEN_HERE"
```

Using environment variables is also supported.

```yml
token: "env:TOKEN_VARIABLE"
```

You can override the given token using your terminal

```bash
npx reciple --token "YOUR_TOKEN_HERE"
```

Use env variable

```bash
npx reciple --token "env:TOKEN_VARIABLE"
```

***

> ## Fun Fact
> The name reciple is from a minecraft bug. The bug was a misspelling of the word `recipe`. [View Mojang Bug Report](https://bugs.mojang.com/browse/MC-225837)
