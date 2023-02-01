module.exports = {
    versions: `^7`,
    commands: [
        {
            commandType: 2,
            name: 'tae',
            description: 'Tae ko',
            execute: async message => message.reply('tite')
        }
    ],
    onLoad() {
        console.log(`Loaded UwUue;`);
        return true;
    }
};
