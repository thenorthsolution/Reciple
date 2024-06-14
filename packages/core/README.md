<h1 align="center">
    <img src="https://i.imgur.com/h0ljJR5.png" width="50%">
    <br>
</h1>

<h3 align="center">
    <a href="https://discord.gg/2gyckrwK7b">
        <img src="https://img.shields.io/discord/1032785824686817291?color=5865F2&logo=discord&logoColor=white">
    </a>
    <a href="https://npmjs.org/package/@reciple/core">
        <img src="https://img.shields.io/npm/v/%40reciple/core?label=npm">
    </a>
    <a href="https://github.com/thenorthsolution/Reciple/tree/main/packages/core">
        <img src="https://img.shields.io/npm/dt/%40reciple/core?maxAge=3600">
    </a>
    <a href="https://www.codefactor.io/repository/github/thenorthsolution/reciple">
        <img src="https://www.codefactor.io/repository/github/thenorthsolution/reciple/badge">
    </a>
    <br>
    <div style="padding-top: 1rem">
        <a href="https://discord.gg/2gyckrwK7b">
            <img src="http://invidget.switchblade.xyz/2gyckrwK7b">
        </a>
    </div>
</h3>

---

## About

`@reciple/core` contains the core components of Reciple such as the extended Discord.js Client and command builders.

## Usage

```js
// @ts-check
import { RecipleClient, SlashCommandBuilder } from '@reciple/core';

const client = new RecipleClient({
    token: 'YOUR_TOKEN',
    client: {
        intents: ['Guilds']
    }
});

await client.login();

client.commands?.add(
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong!')
        .setExecute(async ({ interaction }) => {
            await interaction.reply('Pong!');
        }),
)

await client.commands?.registerApplicationCommands();

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) await client.commands?.execute(interaction);
});

```
