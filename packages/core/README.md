<h1 align="center">
    <img src="/assets/SVG/reciple.svg" width="50%">
    <br>
</h1>

<h3 align="center">
    <a href="https://discord.gg/thenorthsolution">
        <img src="https://img.shields.io/discord/1032785824686817291?color=5865F2&logo=discord&logoColor=white">
    </a>
    <a href="https://npmjs.org/package/@reciple/core">
        <img src="https://img.shields.io/npm/v/%40reciple/core?label=npm">
    </a>
    <a href="https://github.com/thenorthsolution/Reciple/tree/main/packages/core">
        <img src="https://img.shields.io/npm/dt/%40reciple/core?maxAge=3600">
    </a>
    <a href="https://www.codefactor.io/repository/github/falloutstudios/reciple/overview/main">
        <img src="https://www.codefactor.io/repository/github/falloutstudios/reciple/badge/main">
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

`@reciple/core` contains the core components of Reciple such as the extended Discord.js Client and command builders.

## Usage

```js
import { RecipleClient, SlashCommandBuilder } from '@reciple/core';

const client = new RecipleClient({
    token: 'MTExIHlvdSEgpHJpZWQgMTEx.O5rKAA.dQw4w9WgXxQ_wpV-gGg4PSk_bm8',
    client: {
        intents: [
            'Guilds',
            'GuildMessages',
            'MessageContent'
        ]
    }
});

await client.login();

client.commands.add(
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Ping bot')
        .setExecute(async ({ interaction }) => interaction.reply(`Pong!`))
);

await client.commands.registerApplicationCommands();

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) await client.commands.execute(interaction);
});
```
