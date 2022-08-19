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

A simple Dicord.js handler that just works.
</h3>

***

<p align="center">
    <a href="https://discord.gg/2CattJYNpw" title="">
        <img src="https://i.imgur.com/GffJByO.png" alt="Join Discord">
    </a>
</p>

# Features

* [CLI based handler](#command-line)
* [Message command builder](#messagecommandbuilder-example)
* [Built-in message command validation](#built-in-message-command-validation)
* Automatically register application commands
* [Built-in command cooldowns](#command-cooldowns)
* [Highly configurable](#config)

## Installation

To install the bot, run the following command in your terminal:

```bash
npm i reciple
```

You can initialize the bot to the current directory with the following command in your terminal:

```bash
npx reciple
```

It will ask you to continue if the directory is not empty. Type `y` to continue. After the bot has been initialized, it will ask you for your bot token.

> You can change the token anytime you want

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

## Starting the bot
To start the bot, run the following command:

```bash
npx reciple
```

## Command line

**Usage:** `reciple [options] [current-working-directory]`

**Arguments:**
* `current-working-directory` Change the current working directory

**Options:**
* `-v, --version` output the version number
* `-t, --token <token>` Replace used bot token
* `-c, --config <config>` Change path to config file
* `-D, --debugmode` Enable debug mode
* `-y, --yes` Automatically agree to Reciple confirmation prompts
* `-v, --version` Display version
* `-h, --help` display help for command

## MessageCommandBuilder Example

* Read docs for [`MessageCommandBuilder`](https://reciple.js.org/classes/MessageCommandBuilder.html)

```js
new MessageCommandBuilder()
    .setName("command")
    .setDescription("Your lil tiny description")
    .addAliases('cmd', 'cmd1')
    .setExecute(command => command.message.reply("Hello!"))
```

## Built-in message command validation

* Read docs for [`MessageCommandBuilder#setValidateOptions()`](https://reciple.js.org/classes/MessageCommandBuilder.html#setValidateOptions)
* Read docs for [`MessageCommandOptionBuilder`](https://reciple.js.org/classes/MessageCommandOptionBuilder.html)
* Read docs for [`MessageCommandOptionManager`](https://reciple.js.org/classes/MessageCommandOptionManager.html)
```js
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

## Command Cooldowns

* Read docs for [`SlashCommandBuilder#setCooldown()`](https://reciple.js.org/classes/SlashCommandBuilder.html#setCooldown)
* Read docs for [`MessageCommandBuilder#setCooldown()`](https://reciple.js.org/classes/MessageCommandBuilder.html#setCooldown)
* Read docs for [`CommandHaltReason`](https://reciple.js.org/enums/CommandHaltReason.html)
* Read docs for [`CommandCooldownData`](https://reciple.js.org/interfaces/CommandCooldownData.html)

```js
// Slash command
new SlashCommandBuilder()
    .setName("command")
    .setDescription("Your lil tiny description")
    .setCooldown(1000 * 60) // Cooldown in milliseconds
    .setExecute(command => command.interaction.reply('hi'))
    .setHalt(async halt => {
        // Handle command on cooldown
        if (halt.reason == CommandHaltReason.Cooldown) {
            await halt.executeData.interaction.reply((halt.expireTime - Date.now()) / 1000 + " seconds cooldown");
            return true;
        }
    })

// Message command
new MessageCommandBuilder()
    .setName("command")
    .setDescription("Your lil tiny description")
    .setCooldown(1000 * 60) // Cooldown in milliseconds
    .setExecute(command => command.message.reply('hi'))
    .setHalt(async halt => {
        // Handle command on cooldown
        if (halt.reason == CommandHaltReason.Cooldown) {
            await halt.executeData.message.reply((halt.expireTime - Date.now()) / 1000 + " seconds cooldown");
            return true;
        }
    })
```

***

> ## Fun Fact
> The name reciple is from a minecraft bug. The bug was a misspelling of the word `recipe`. [View Mojang Bug Report](https://bugs.mojang.com/browse/MC-225837)

***

[#letTheEarthBreathe](https://rebellion.global/)
