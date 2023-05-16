import { CommandType, SlashCommandBuilder } from "reciple";

export default {
    versions: ['^7'],
    commands: [
        new SlashCommandBuilder()
            .setName('slash-b')
            .setDescription('Slash Command Builder')
            .setExecute(async data => data.interaction.reply('Hello')),
        {
            commandType: CommandType.SlashCommand,
            name: 'slash-d',
            description: 'Slash Command Builder',
            execute: async data => data.interaction.reply('Hello')
        }
    ],
    async onStart() {
        return true;
    }
};
