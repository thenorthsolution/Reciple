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

## Highlights

-   [CLI based handler](#cli-usage)
-   [Supports Context Menus](#context-menus)
-   [Supports Prefix/Message commands](#message-commands)
-   [Validate messsage command options](#validate-message-command-options)
-   [Supports Slash Commands](#slash-commands)
-   [Built-in command cooldowns](#command-cooldowns)
-   Automatically register application commands
-   [Highly configurable](#config)

## Using Templates

To use templates use the following command in your terminal:

```bash
npm create reciple@latest
```

After that configure the template you want to use. [Learn More](https://reciple.js.org/guide/getting-started/installation)

## CLI usage

```yml
Usage: reciple [options] [cwd]

Reciple is a Discord.js bot framework

Arguments:
  cwd                  Change the current working directory

Options:
  -v, --version        output the version number
  -t, --token <token>  Replace used bot token
  -c, --config <dir>   Set path to a config file
  -D, --debugmode      Enable debug mode
  -y, --yes            Agree to all Reciple confirmation prompts
  --env <file>         .env file location
  --shardmode          Modifies some functionalities to support sharding
  --setup              Create required config without starting the bot
  -h, --help           display help for command
```

## Message Commands

Reciple provides a built-in `MessageCommandBuilder` class that can be used for message command handler.

[**Read Docs**](https://reciple.js.org/docs/core/main/classes:MessageCommandBuilder)
```js
import { MessageCommandBuilder } from 'reciple';

new MessageCommandBuilder()
    .setName("command")
    .setDescription("Your lil tiny description")
    .addAliases("cmd", "cmd1")
    .setExecute(command => command.message.reply("Hello!"));
```

### Validate Message Command Options

[**Read Docs**](https://reciple.js.org/docs/core/main/classes:MessageCommandOptionBuilder)
```js
import { MessageCommandBuilder } from 'reciple';

new MessageCommandBuilder()
    .setName("command")
    .setDescription("Your lil tiny description")
    .addAliases("cmd", "cmd1")
    .setValidateOptions(true) // Validate options
    .addOption(option => option
        .setName("quantity")
        .setDescription("Must be a number")
        .setRequired(true) // A required option
        .setValidate(({ value }) => !isNaN(Number(value))) // Validate value
        .setResolveValue(({ value }) => Number(value)) // Resolves the option value
    )
    .setExecute(async command => {
        /**
         * @type {number}
         */
        const quantity = await data.options.getOptionValue('number', { required: true, resolveValue: true });;
        await command.message.reply("Quantity: " + quantity);
    });
```

## Context Menus

Reciple provides extended `ContextMenuCommandBuilder` class that can be used for context menu command handler.

[**Read Docs**](https://reciple.js.org/docs/core/main/classes:ContextMenuCommandBuilder)
```js
import { ApplicationCommandType } from 'discord.js';
import { ContextMenuCommandBuilder } from 'reciple';

new ContextMenuCommandBuilder()
    .setName("Ban")
    .setType(ApplicationCommandType.User)
    .setExecute(async ({ interaction }) => {
        if (!interaction.inCachedGuild()) return;

        await interaction.deferReply();
        await interaction.targetMember.ban();
        await interaction.editReply(`Banned ${interaction.targetUser}`);
    });
```

## Slash Commands

Reciple provides extended `SlashCommandBuilder` class that can be used for slash command handler.
[**Read Docs**](https://reciple.js.org/docs/core/main/classes:SlashCommandBuilder)

```js
import { SlashCommandMenuBuilder } from 'reciple';

new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Pong")
    .setExecute(async ({ interaction }) => {
        await interaction.reply(`Pong!`);
    });
```

## Command Cooldowns

[**Read Docs**](https://reciple.js.org/docs/core/main/classes:BaseCommandBuilder#setcooldown)

```js
import { ContextMenuCommandBuilder, MessageCommandBuilder, SlashCommandBuilder } from 'reciple';
import { ApplicationCommandType } from 'discord.js';

new ContextMenuCommandBuilder()
    .setName("Context Menu")
    .setType(ApplicationCommandType.Message)
    .setCooldown(1000 * 5) // 5 seconds cooldown
    .setExecute(async ({ interaction }) => {
        await interaction.reply(`Hello!`);
    });

new MessageCommandBuilder()
    .setName("message-command")
    .setDescription(`Your command`)
    .setCooldown(1000 * 5) // 5 seconds cooldown
    .setExecute(async ({ message }) => {
        await message.reply(`Hello!`);
    });

new SlashCommandBuilder()
    .setName("slash-command")
    .setDescription(`Your command`)
    .setCooldown(1000 * 5) // 5 seconds cooldown
    .setExecute(async ({ interaction }) => {
        await interaction.reply(`Hello!`);
    });
```

## Config

You can configure the bot in `reciple.mjs` usually located in the bot's root directory.

### Token

You can change the token in config.

```js
token: "Your Token" // Directly set token string
token: process.env.TOKEN // Use env variable
```

You can override the given token as cli flag

```bash
reciple --token "YOUR_TOKEN_HERE"
reciple --token "env:TOKEN_VARIABLE"
```

---

> ## Fun Fact
>
> The name reciple is from a minecraft bug. The bug was a misspelling of the word `recipe`. [View Mojang Bug Report](https://bugs.mojang.com/browse/MC-225837)
