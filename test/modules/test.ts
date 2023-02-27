import { ApplicationCommandType } from 'discord.js';
import { ContextMenuCommandBuilder } from 'reciple';

export default {
    versions: [`^7`],
    commands: [
        new ContextMenuCommandBuilder()
            .setName('test')
            .setType(ApplicationCommandType.Message)
            .setExecute(async ({ interaction }) => { await interaction.reply(`UwU`); })
    ],
    onStart() {
        return true;
    }
};
