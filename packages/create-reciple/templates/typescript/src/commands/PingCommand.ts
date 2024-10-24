import { AnyCommandExecuteData, CommandType, ContextMenuCommandBuilder, MessageCommandBuilder, RecipleModuleData, SlashCommandBuilder, type AnyCommandResolvable } from "reciple";

export class PingCommand implements RecipleModuleData {
    public commands: AnyCommandResolvable[] = [
        new ContextMenuCommandBuilder()
            .setName('ping')
            .setType('Message')
            .setExecute(data => this.handleCommandExecute(data)),
        new MessageCommandBuilder()
            .setName('ping')
            .setDescription('Replies with pong!')
            .setExecute(data => this.handleCommandExecute(data)),
        new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong!')
        .setExecute(data => this.handleCommandExecute(data)),
    ];

    /**
     * Executed when module is started (Bot is not logged in).
     */
    async onStart(): Promise<boolean> {
        return true;
    }

    /**
     * Executes when the module is loaded (Bot is logged in).
     */
    async onLoad(): Promise<void> {}

    /**
     * Executes when the module is unloaded (Bot is pre log out).
     */
    async onUnload(): Promise<void> {}

    /**
     * Sets the commands
     */
    async handleCommandExecute(data: AnyCommandExecuteData): Promise<void> {
        switch (data.type) {
            case CommandType.ContextMenuCommand:
            case CommandType.SlashCommand:
                await data.interaction.reply('Pong!');
                return;
            case CommandType.MessageCommand:
                await data.message.reply('Pong!');
                return;
        }
    }
}

export default new PingCommand();
