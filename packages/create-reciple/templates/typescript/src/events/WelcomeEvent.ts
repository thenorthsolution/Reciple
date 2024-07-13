import { setClientEvent, setRecipleModule, setRecipleModuleLoad, setRecipleModuleStart, setRecipleModuleUnload } from '@reciple/decorators';
import { GuildMember } from "discord.js";
import { RecipleModuleData } from 'reciple';

@setRecipleModule()
export class WelcomeEvent implements RecipleModuleData {
    /**
     * Executed when module is started (Bot is not logged in).
     */
    @setRecipleModuleStart()
    async onStart(): Promise<boolean> {
        return true;
    }

    /**
     * Executes when the module is loaded (Bot is logged in).
     */
    @setRecipleModuleLoad()
    async onLoad(): Promise<void> {}

    /**
     * Executes when the module is unloaded (Bot is pre log out).
     */
    @setRecipleModuleUnload()
    async onUnload(): Promise<void> {}

    /**
     * Called when a user joins the server.
     */
    @setClientEvent('guildMemberAdd')
    async handleWelcomeEvent(member: GuildMember): Promise<void> {
        await member.send(`Welcome to **${member.guild.name}** server!`)
            .catch(() => null);
    }
}

export default new WelcomeEvent();
