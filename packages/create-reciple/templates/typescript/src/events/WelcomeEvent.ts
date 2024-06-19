import { GuildMember } from "discord.js";
import { RecipleModuleData, RecipleModuleLoadData, RecipleModuleUnloadData } from 'reciple';

export class WelcomeEvent implements RecipleModuleData {
    constructor() {
        // Make sure `handleWelcomeEvent` is bound to `this`
        this.handleWelcomeEvent = this.handleWelcomeEvent.bind(this);
    }

    /**
     * Executed when module is started (Bot is not logged in).
     */
    async onStart(): Promise<boolean> {
        return true;
    }

    /**
     * Executes when the module is loaded (Bot is logged in).
     */
    async onLoad({ client }: RecipleModuleLoadData): Promise<void> {
        // Add the listener to the client
        client.on('guildMemberAdd', this.handleWelcomeEvent);
    }

    /**
     * Executes when the module is unloaded (Bot is pre log out).
     */
    async onUnload({ client }: RecipleModuleUnloadData): Promise<void> {
        // Properly remove the listener from the client
        client.removeListener('guildMemberAdd', this.handleWelcomeEvent);
    }

    /**
     * Called when a user joins the server.
     */
    async handleWelcomeEvent(member: GuildMember): Promise<void> {
        await member.send(`Welcome to **${member.guild.name}** server!`)
            .catch(() => null);
    }
}

export default new WelcomeEvent();
