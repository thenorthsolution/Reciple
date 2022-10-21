const { MessageCommandBuilder } = require('reciple');

module.exports = {
    versions: '^6',
    commands: [
        new MessageCommandBuilder()
            .setName('hi')
            .setDescription('hello')
            .setExecute(data => data.message.reply('Hello!'))
    ],
    onStart() {
        return true;
    }
};
