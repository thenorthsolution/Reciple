// @ts-check
import { CommandType, ContextMenuCommandBuilder, MessageCommandBuilder, SlashCommandBuilder } from "reciple";

export class PingCommand {
    /**
     * The module commands.
     * @typedef {import("reciple").AnyCommandResolvable[]}
     */
    commands = [
        new SlashCommandBuilder()
            .setName('ping')
            .setDescription('Replies with pong!')
            .setExecute(data => this.handleCommandExecute(data)),

        new ContextMenuCommandBuilder()
            .setName('ping')
            .setType('Message')
            .setExecute(data => this.handleCommandExecute(data)),

        new MessageCommandBuilder()
            .setName('ping')
            .setDescription('Replies with pong!')
            .setExecute(data => this.handleCommandExecute(data))
    ];

    /**
     * Executed when module is started (Bot is not logged in).
     *
     * @return {Promise<boolean>}
     */
    async onStart() {
        return true;
    }

    /**
     * Executes when the module is loaded (Bot is logged in).
     *
     * @return {Promise<void>}
     */
    async onLoad() {}

    /**
     * Executes when the module is unloaded (Bot is pre log out).
     *
     * @return {Promise<void>}
     */
    async onUnload() {}

    /**
     * Called by the command builder when a command is executed.
     * 
     * @param {import("reciple").AnyCommandExecuteData} data
     * @returns {Promise<void>}
     */
    async handleCommandExecute(data) {
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
