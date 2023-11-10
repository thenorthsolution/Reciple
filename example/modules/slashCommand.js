// @ts-check
import { CommandType, SlashCommandBuilder } from 'reciple';
import { ApplicationCommandOptionType } from 'discord.js';

/**
 * @type {import('reciple').RecipleModuleData}
 */
export default {
    versions: ['^8'],
    commands: [
        // Using builders
        new SlashCommandBuilder()
            .setName('say')
            .setDescription('Say something')
            .setDMPermission(false)
            .addStringOption(option => option
                .setName('text')
                .setDescription('Your message')
                .setRequired(true)
            )
            .setExecute(async ({ interaction }) => {
                await interaction.deferReply({ ephemeral: true });
                await interaction.channel?.send(interaction.options.getString('text', true));
                await interaction.editReply(`Message sent!`);
            }),

        // Raw command data
        {
            command_type: CommandType.SlashCommand,
            name: 'kick',
            description: 'Kick a user',
            dm_permission: false,
            options: [
                {
                    type: ApplicationCommandOptionType.User,
                    name: 'member',
                    description: 'Target member',
                    required: true
                }
            ],
            execute: async ({ interaction }) => {
                await interaction.deferReply({ ephemeral: true });

                const user = interaction.options.getUser('member', true);
                const member = await interaction.guild?.members.fetch(user.id);

                if (!member) {
                    await interaction.editReply(`User not found`);
                    return;
                }

                await member.ban();
                await interaction.editReply(`Successfully banned ${member.displayName}`);
            }
        }
    ],
    onStart: () => true
};
