// @ts-check
import { CommandType, ContextMenuCommandBuilder } from 'reciple';
import { inlineCode } from 'discord.js';

/**
 * @type {import('reciple').RecipleModuleData}
 */
export default {
    versions: ['^8'],
    commands: [
        // Using builders
        new ContextMenuCommandBuilder()
            .setName('Avatar')
            .setType('User')
            .setExecute(async ({ interaction }) => {
                if (!interaction.isUserContextMenuCommand()) return;

                await interaction.reply(interaction.targetUser.displayAvatarURL());
            }),

        // Raw command data
        {
            command_type: CommandType.ContextMenuCommand,
            name: 'Info',
            type: 'User',
            execute: async ({ interaction }) => {
                if (!interaction.isUserContextMenuCommand()) return;

                await interaction.reply(`${interaction.targetMember} ${inlineCode(interaction.targetId)}`);
            }
        }
    ],
    onStart: () => true
};
