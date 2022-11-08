const { MessageCommandBuilder, CommandHaltReason } = require('reciple');

module.exports = {
    versions: '^6.1',
    commands: [
        new MessageCommandBuilder()
            .setName('hi')
            .setDescription('hello')
            .setValidateOptions(true)
            .addOptions(
                option => option
                    .setName('a')
                    .setDescription('e')
                    .setRequired(true),
                option => option
                    .setName('e')
                    .setDescription('a')
                    .setRequired(false)
                    .setValidator(val => val === 'boi')
            )
            .setExecute(data => data.message.reply('Hello!'))
            .setHalt(data => console.log(data.reason === CommandHaltReason.MissingArguments ? data.executeData.options : undefined))
    ],
    onStart() {
        return true;
    }
};
