// @ts-check
import { CommandHaltReason, CommandType } from 'reciple';

/**
 * @satisfies {import('reciple').CommandHaltData}
 */
export default {
    id: 'org.reciple.js.handleerror',
    contextMenuCommandHalt(data){ return this.halt(data) },
    messageCommandHalt(data){ return this.halt(data) },
    slashCommandHalt(data){ return this.halt(data) },
    /**
     * 
     * @param {import('reciple').AnyCommandHaltTriggerData} data 
     * @returns 
     */
    async halt(data) {
        if (data.reason !== CommandHaltReason.Error) return;

        const content = `An error occured while executing this command`;

        switch (data.commandType) {
            case CommandType.ContextMenuCommand:
            case CommandType.SlashCommand:
                const interaction = data.executeData.interaction;

                if (interaction.replied || interaction.deferred) {
                    await interaction.editReply(content);
                } else {
                    await interaction.reply(content);
                }
                break;
            case CommandType.MessageCommand:
                await data.executeData.message.reply(content);
                break;
        }

        console.log(data.error);

        return true;
    }
};
