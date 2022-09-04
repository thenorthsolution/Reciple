const { CommandBuilderType, CommandHaltReason, MessageCommandBuilder, SlashCommandBuilder } = require('../../bin/index');

module.exports = {
    versions: '^5.4.1',
    commands: [
        {
            type: CommandBuilderType.MessageCommand,
            name: 'pong',
            description: 'Ping!',
            cooldown: 1000 * 10,
            execute: e => { throw new Error("eee"); },
            halt: e => {
                if (e.reason == CommandHaltReason.Error) {
                    e.executeData.message.reply(String(e.error));
                    return true;
                }
            }
        },
        {
            type: CommandBuilderType.SlashCommand,
            name: 'pong',
            description: 'Ping!',
            cooldown: 1000 * 10,
            execute: e => e.interaction.reply("Pong!"),
            halt: e => {
                if (e.reason == CommandHaltReason.Error) {
                    e.executeData.interaction.reply(String(e.error));
                    return true;
                }
            }
        },
        new MessageCommandBuilder()
            .setName("ping")
            .setDescription("Pong!")
            .setCooldown(1000 * 10)
            .setExecute(e => { throw new Error("err"); })
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
