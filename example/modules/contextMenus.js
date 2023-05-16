import { CommandType, ContextMenuCommandBuilder } from "reciple";

export default {
    versions: ['^7'],
    commands: [
        new ContextMenuCommandBuilder()
            .setName('Context Menu Builder')
            .setType('Message')
            .setExecute(async data => data.interaction.reply('Hello')),
        {
            commandType: CommandType.ContextMenuCommand,
            name: 'Context Menu Data',
            type: 'Message',
            execute: async data => data.interaction.reply('Hello')
        }
    ],
    async onStart() {
        return true;
    }
};
