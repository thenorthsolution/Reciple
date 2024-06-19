// @ts-check

import { CommandHaltReason, CommandType } from 'reciple';

export class CommandErrorHalt {
    id = 'my.reciple.js.commanderrorhalt';
    disabled = false;

    /**
     * @param {import('reciple').ContextMenuCommandHaltTriggerData} data
     */
    contextMenuCommandHalt(data) {
        return this.halt(data);
    }

    /**
     * @param {import('reciple').MessageCommandHaltTriggerData} data
     */
    messageCommandHalt(data) {
        return this.halt(data);
    }

    /**
     * @param {import('reciple').SlashCommandHaltTriggerData} data
     */
    slashCommandHalt(data) {
        return this.halt(data);
    }

    /**
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

        reciple.logger?.error(data.error);

        return true;
    }
}
