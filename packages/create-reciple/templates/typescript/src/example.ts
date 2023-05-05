import { ContextMenuCommandBuilder, MessageCommandBuilder, RecipleModuleScript, SlashCommandBuilder } from 'reciple';
import { ApplicationCommandType } from 'discord.js';

export default {
    versions: ['^7'], // Module supports reciple client version 7
    commands: [
        // Right click a message to execute command
        new ContextMenuCommandBuilder()
            .setName(`Test Context Menu`)
            .setType(ApplicationCommandType.Message)
            .setExecute(async data => {
                await data.interaction.reply(`Hello!`);
            }),

        // Send !test to execute command
        new MessageCommandBuilder()
            .setName(`test`)
            .setDescription(`Test message command`)
            .setAliases(`t`)
            .setExecute(async data => {
                await data.message.reply(`Test message command`);
            }),

        // Use /test to execute command
        new SlashCommandBuilder()
            .setName(`test`)
            .setDescription(`Test slash command`)
            .setExecute(async data => {
                await data.interaction.reply(`Test slash command`);
            })
    ],

    // Module resolved logic here (Bot not logged in)
    onStart(client) {
        return true;
    },

    // Module loaded logic here (Bot logged in)
    onLoad(client, module_) {},

    // Unload logic here
    onUnload({ reason, client }) {}
} satisfies RecipleModuleScript;
