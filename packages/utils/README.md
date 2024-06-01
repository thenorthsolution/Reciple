<h1 align="center">
    <img src="https://i.imgur.com/h0ljJR5.png" width="50%">
    <br>
</h1>

<h3 align="center">
    <a href="https://discord.gg/thenorthsolution">
        <img src="https://img.shields.io/discord/1032785824686817291?color=5865F2&logo=discord&logoColor=white">
    </a>
    <a href="https://npmjs.org/package/@reciple/utils">
        <img src="https://img.shields.io/npm/v/%40reciple/utils?label=npm">
    </a>
    <a href="https://github.com/thenorthsolution/Reciple/tree/main/packages/utils">
        <img src="https://img.shields.io/npm/dt/%40reciple/docgen?maxAge=3600">
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

`@reciple/utils` global utilities used by reciple modules

## Usage

```js
import { MessageURLData } from '@reciple/utils';
import { RecipleClient } from '@reciple/core';

const client = new RecipleClient({
    token: process.env.TOKEN,
    client: {
        intents: ['Guilds']
    }
});

const messageData = await MessageURLData.fetch('https://discord.com/channels/0000000000000000000/0000000000000000000/0000000000000000000', client);

if (messageData.inGuild()) await messageData.message.reply('yeah');

await client.login();
```
