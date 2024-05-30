// @ts-check

import { SlashCommandBuilder } from 'reciple';

/**
 * @type {import('reciple').RecipleModuleData}
 */
export default {
    commands: [
        new SlashCommandBuilder()
            .setName('say')
            .setDescription('Send something as the bot')
            .setRequiredBotPermissions('SendMessages')
            .setRequiredMemberPermissions('ManageMessages')
            .setDMPermission(false)
            .addStringOption(option => option
                .setName('message')
                .setDescription('The message to send on chat')
                .setRequired(true)
            )
            .setExecute(async ({ interaction, client }) => {
                const message = interaction.options.getString('message', true);

                await interaction.deferReply({ ephemeral: true });

                const channel = await client.channels.fetch(interaction.channelId).then(c => c?.isTextBased() ? c : null);

                await channel?.send(message);
                await interaction.editReply('Message sent!');
            })
    ],
    onStart: () => true
};
