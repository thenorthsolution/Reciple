const { ContextMenuCommandBuilder } = require('reciple');
const { ApplicationCommandType } = require('discord.js');

module.exports = {
    versions: `^7`,
    commands: [
        {
            commandType: 2,
            name: 'tae',
            description: 'Tae ko',
            execute: async ({message}) => message.reply('tite')
        },
        {
            commandType: 3,
            name: 'test',
            description: 'Sus',
            execute: async ({interaction}) => interaction.reply('e')
        },
        new ContextMenuCommandBuilder()
            .setName('Kill')
            .setType(ApplicationCommandType.User)
            .setExecute(async ({interaction}) => interaction.reply(`Killed this mf`))
    ],
    onLoad() {
        console.log(`Loaded UwUue;`);
        return true;
    }
};
