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
    /**
     * 
     * @param {import('../../').RecipleClient} client 
     * @returns 
     */
    onStart(client) {
        client.logger.log("Module started");

        client.on('recipleRegisterApplicationCommands', () => {
            client.logger.log(`Commands registered`);
        });

        client.on('recipleCommandExecute', data => {
            client.logger.log(`Command executed: ${data.builder.name}`);
        });

        client.on('recipleCommandHalt', data => {
            client.logger.log(`Command halted: ${data.executeData.builder.name}`);
        });

        return true;
    },
    onLoad(client) {
        client.logger.log("Module loaded");
    }
};
