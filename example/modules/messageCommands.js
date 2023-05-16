import { CommandType, MessageCommandBuilder } from "reciple";

export default {
    versions: ['^7'],
    commands: [
        new MessageCommandBuilder()
            .setName('msgcmd-b')
            .setDescription('Message Command Builder')
            .setExecute(async data => data.message.reply('Hello')),
        {
            commandType: CommandType.MessageCommand,
            name: 'msgcmd-d',
            description: 'Message Command Builder',
            execute: async data => data.message.reply('Hello')
        }
    ],
    async onStart() {
        return true;
    }
};
