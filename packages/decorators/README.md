<h1 align="center">
    <img src="https://i.imgur.com/h0ljJR5.png" width="50%">
    <br>
</h1>

<h3 align="center">
    <a href="https://discord.gg/2gyckrwK7b">
        <img src="https://img.shields.io/discord/1032785824686817291?color=5865F2&logo=discord&logoColor=white">
    </a>
    <a href="https://npmjs.org/package/create-reciple">
        <img src="https://img.shields.io/npm/v/create-reciple?label=npm">
    </a>
    <a href="https://github.com/thenorthsolution/Reciple/tree/main/packages/create-reciple">
        <img src="https://img.shields.io/npm/dt/create-reciple?maxAge=3600">
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

`@reciple/decorators` is a collection of decorators used in Reciple projects.

## Installation

```bash
npm i @reciple/decorators
yarn add @reciple/decorators
pnpm i @reciple/decorators
```

## Usage
```ts
import { setClientEvent, setContextMenuCommand, setMessageCommand, setRecipleModule, setRecipleModuleLoad, setRecipleModuleStart, setRecipleModuleUnload, setSlashCommand } from '@reciple/decorators';
import { AnyCommandExecuteData, CommandType, RecipleModuleData } from "reciple";
import { ApplicationCommandType, type Message } from 'discord.js';

@setRecipleModule()
export class PingCommand implements RecipleModuleData {
    @setRecipleModuleStart()
    async onStart(): Promise<boolean> {
        return true;
    }

    @setRecipleModuleLoad()
    async onLoad(): Promise<void> {}

    @setRecipleModuleUnload()
    async onUnload(): Promise<void> {}

    @setContextMenuCommand({ name: 'ping', type: ApplicationCommandType.Message })
    @setMessageCommand({ name: 'ping', description: 'Replies with pong!' })
    @setSlashCommand({ name: 'ping', description: 'Replies with pong!' })
    async handleCommandExecute(data: AnyCommandExecuteData): Promise<void> {
        switch (data.type) {
            case CommandType.ContextMenuCommand:
            case CommandType.SlashCommand:
                await data.interaction.reply('Pong!');
                return;
            case CommandType.MessageCommand:
                await data.message.reply('Pong!');
                return;
        }
    }

    @setClientEvent('messageCreate')
    async handleMessageEvent(message: Message): Promise<void> {
        if (!reciple.isReady() || (!message.content.includes(reciple.user.id) && !message.content.includes(reciple.user.displayName))) return;

        await message.react('👀');
    }
}

export default new PingCommand();
```
