// @ts-check

import { GuildMember } from "discord.js";

export class WelcomeEvent {
    constructor() {
        // Make sure `handleWelcomeEvent` is bound to `this`
        this.handleWelcomeEvent = this.handleWelcomeEvent.bind(this);
    }

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
     * @param {import("reciple").RecipleModuleLoadData} param0
     * @return {Promise<void>}
     */
    async onLoad({ client }) {
        // Add the listener to the client
        client.on('guildMemberAdd', this.handleWelcomeEvent);
    }

    /**
     * Executes when the module is unloaded (Bot is pre log out).
     *
     * @param {import("reciple").RecipleModuleUnloadData} param0
     * @return {Promise<void>}
     */
    async onUnload({ client }) {
        // Properly remove the listener from the client
        client.removeListener('guildMemberAdd', this.handleWelcomeEvent);
    }

    /**
     * Called when a user joins the server.
     *
     * @param {GuildMember} member
     * @return {Promise<void>}
     */
    async handleWelcomeEvent(member) {
        await member.send(`Welcome to **${member.guild.name}** server!`)
            .catch(() => null);
    }
}

export default new WelcomeEvent();
