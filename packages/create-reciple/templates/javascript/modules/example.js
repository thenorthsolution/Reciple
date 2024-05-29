import { SlashCommandBuilder, ContextMenuCommandBuilder, MessageCommandBuilder } from 'reciple';

/**
 * @type {import('reciple').RecipleModuleData}
 */
export default {
    // Supported client versions
    versions: ['^8'],

    // Module commands
    commands: [
        new ContextMenuCommandBuilder()
            .setName('test')
            .setType('Message')
            .setExecute(async ({ interaction }) => {
                await interaction.reply(`Hello, world!`);
            }),
        new MessageCommandBuilder()
            .setName('test')
            .setDescription('A test command')
            .setExecute(async ({ message }) => {
                await message.reply(`Hello, world!`);
            }),
        new SlashCommandBuilder()
            .setName('test')
            .setDescription('A test command')
            .setExecute(async ({ interaction }) => {
                await interaction.reply(`Hello, world!`);
            })
    ],

    // Executed when module is started (Bot is not logged in)
    onStart: ({ client }) => {
        return true; // Return true when the module is loaded, false if not
    },

    // Executed when module is loaded (Bot is logged in)
    onLoad: ({ client }) => {
        // Return/throw a string or error on load fail
    },


    // Executed when module is unloaded
    onUnload: ({ client }) => {
        // Return/throw a string or error on unload fail
    }
}
