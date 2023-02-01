const { ContextMenuCommandBuilder } = require('reciple');

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
        }
    ],
    onLoad() {
        console.log(`Loaded UwUue;`);
        return true;
    }
};
