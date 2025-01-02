// @ts-check
import { ApplicationCommandType } from "discord.js";
import { ContextMenuCommandBuilder } from "reciple";

/**
 * @type {import("reciple").RecipleModuleData}
 */
export class Avatar {
    commands = [
        new ContextMenuCommandBuilder()
            .setName('Avatar')
            .setType(ApplicationCommandType.User)
            .setExecute(async ({ interaction }) => {
                if (!interaction.isUserContextMenuCommand()) return;

                await interaction.deferReply();

                const member = await interaction.guild?.members.fetch(interaction.targetId);

                await interaction.editReply({
                    content: member?.displayAvatarURL() ?? interaction.user.displayAvatarURL()
                });
            })
    ];

    onStart() {
        return true;
    }
}

export default new Avatar();
