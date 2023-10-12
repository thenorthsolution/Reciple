<h1 align="center">
    <img src="https://i.imgur.com/DWM0tJL.png" width="50%">
    <br>
</h1>

<h3 align="center">
    <a href="https://discord.gg/VzP8qW7Z8d">
        <img src="https://img.shields.io/discord/993105237000855592?color=5865F2&logo=discord&logoColor=white">
    </a>
    <a href="https://npmjs.org/package/@reciple/utils">
        <img src="https://img.shields.io/npm/v/%40reciple/utils?label=npm">
    </a>
    <a href="https://github.com/FalloutStudios/Reciple/tree/main/packages/utils">
        <img src="https://img.shields.io/npm/dt/%40reciple/docgen?maxAge=3600">
    </a>
    <a href="https://www.codefactor.io/repository/github/falloutstudios/reciple/overview/main">
        <img src="https://www.codefactor.io/repository/github/falloutstudios/reciple/badge/main">
    </a>
</h3>

## About

`@reciple/utils` global utilities used by reciple modules

## Usage

```js
import { parseMessageURL, resolveFromCachedCollection } from '@reciple/utils';
import { RecipleClient } from '@reciple/core';

const client = new RecipleClient({
    token: process.env.TOKEN,
    client: {
        intents: []
    }
});

const message = parseMessageURL('https://discord.com/channels/0000000000000000000/0000000000000000000/0000000000000000000');

if (message.guildId) {
    const guild = await resolveFromCachedCollection(message.guildId, client.guilds);
    const channel = await resolveFromCachedCollection(message.channelId, guild.channels);
    const message = await resolveFromCachedCollection(message.messageId, channel.messages);

    await message.reply('yeah');
}

await client.login();
```
