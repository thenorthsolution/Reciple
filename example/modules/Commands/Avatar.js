// @ts-check
import { ContextMenuCommandBuilder } from "reciple";

/**
 * @type {import("reciple").RecipleModuleData}
 */
export default {
    versions: '^9',
    commands: [
        new ContextMenuCommandBuilder()
            .setName('Avatar')
            .setType('User')
            .setExecute(async ({ interaction }) => {
                if (!interaction.isUserContextMenuCommand()) return;

                await interaction.deferReply();

                const member = await interaction.guild?.members.fetch(interaction.targetId);

                await interaction.editReply({
                    content: member?.displayAvatarURL() ?? interaction.user.displayAvatarURL()
                });
            })
    ],
    onStart: () => true
}
