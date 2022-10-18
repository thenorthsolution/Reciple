const { CommandBuilderType, CommandHaltReason, MessageCommandBuilder, SlashCommandBuilder } = require('../../');

module.exports = {
    versions: '^6',
    commandHalt(e) {
        if (e.reason == CommandHaltReason.Error) {
            e.executeData.message.reply(String(e.error));
            return true;
        }
    },
    commands: [
        new MessageCommandBuilder()
            .setName("ping")
            .setDescription("Pong!")
            .setCooldown(1000 * 10)
            .setExecute(e => e.message.reply('Pong!'))
            .setHalt(this.commandHalt),
        new SlashCommandBuilder()
            .setName("pong")
            .setDescription("Ping!")
            .setCooldown(1000 * 10)
            .setRequiredMemberPermissions(['AddReactions', 'ChangeNickname'])
            .setExecute(e => e.interaction.reply(`Ping!`))
            .setHalt(this.commandHalt)
    ],
    onStart(client) {
        client.logger.log("Module started");

        return true;
    },
    onLoad(client) {
        client.logger.log("Module loaded");
    }
};
