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

`@reciple/client` extends [discord.js](https://npmjs.com/package/discord.js) Client. This contains the core functions of Reciple.

## Usage

```js
import { RecipleClient, SlashCommandBuilder } from '@reciple/client';

const client = new RecipleClient({
    recipleOptions: {
        token: 'MTExIHlvdSEgpHJpZWQgMTEx.O5rKAA.dQw4w9WgXxQ_wpV-gGg4PSk_bm8'
    },
    intents: [
        'Guilds',
        'GuildMessages',
        'MessageContent'
    ]
});

client.commands.add(
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Ping bot')
        .setExecute(async ({ interaction }) => interaction.reply(`Pong!`))
);

await client.login();
await client.commands.registerApplicationCommands();

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) await client.commands.execute(interaction);
});
```
