# @reciple/client

Extended [discord.js](https://npmjs.com/package/discord.js) Client that makes command handling easier.

## Example
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
    if (interaction.isChatInputCommand()) await SlashCommandBuilder.execute(client, interaction);
});
```
