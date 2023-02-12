const { ContextMenuCommandBuilder, MessageCommandBuilder, SlashCommandBuilder } = require('reciple');
const { ApplicationCommandType } = require('discord.js');

/**
 * @type {import('reciple').RecipleModuleScript}
 */
module.exports = {
    versions: ['^7'], // Module supports reciple client version 7
    commands: [
        // Right click a message to execute command
        new ContextMenuCommandBuilder()
            .setName(`Test Context Menu`)
            .setType(ApplicationCommandType.Message)
            .setExecute(async data => data.interaction.reply(`Hello!`)),

        // Send !test to execute command
        new MessageCommandBuilder()
            .setName(`test`)
            .setDescription(`Test message command`)
            .setAliases(`t`)
            .setExecute(async data => data.message.reply(`Test message command`)),

        // Use /test to execute command
        new SlashCommandBuilder()
            .setName(`test`)
            .setDescription(`Test slash command`)
            .setExecute(async data => data.interaction.reply(`Test slash command`))
    ],

    // Module resolved logic here (Bot not logged in)
    onStart(client) {
        return true;
    },

    // Module loaded logic here (Bot logged in)
    onLoad(client, module) {},

    // Unload logic here
    onUnload({ reason, client }) {}
};
