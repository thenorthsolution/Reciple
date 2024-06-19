import { AnyCommandHaltTriggerData, CommandHaltData, CommandHaltReason, CommandType, ContextMenuCommandHaltTriggerData, MessageCommandHaltTriggerData, SlashCommandHaltTriggerData } from 'reciple';

export class CommandErrorHalt implements CommandHaltData {
    id = 'my.reciple.js.commanderrorhalt';
    disabled = false;

    contextMenuCommandHalt(data: ContextMenuCommandHaltTriggerData) {
        return this.halt(data);
    }

    messageCommandHalt(data: MessageCommandHaltTriggerData) {
        return this.halt(data);
    }

    slashCommandHalt(data: SlashCommandHaltTriggerData) {
        return this.halt(data);
    }

    async halt(data: AnyCommandHaltTriggerData) {
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
