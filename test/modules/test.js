const { CommandBuilderType, CommandHaltReason, MessageCommandBuilder, SlashCommandBuilder } = require('../../');

module.exports = {
    versions: '^5.4.1',
    commands: [
        new MessageCommandBuilder()
            .setName("ping")
            .setDescription("Pong!")
            .setCooldown(1000 * 10)
            .setExecute(e => e.message.reply('pong'))
            .setHalt(e => {
                if (e.reason == CommandHaltReason.Error) {
                    e.executeData.message.reply(String(e.error));
                    return true;
                }
            }),
        new SlashCommandBuilder()
            .setName("ping")
            .setDescription("Pong!")
            .setCooldown(1000 * 10)
            .setExecute(e => e.interaction.reply(`Pong!`))
            .setHalt(e => {
                if (e.reason == CommandHaltReason.Error) {
                    e.executeData.interaction.reply(String(e.error));
                    return true;
                }
            })
    ],
    onStart(client) {
        client.logger.log("Module started");

        return true;
    },
    onLoad(client) {
        client.logger.log("Module loaded");
    }
};
