import { setContextMenuCommand, setMessageCommand, setRecipleModule, setRecipleModuleLoad, setRecipleModuleStart, setRecipleModuleUnload, setSlashCommand } from '@reciple/decorators';
import { ApplicationCommandType } from 'discord-api-types/v10';
import { AnyCommandExecuteData, CommandType, RecipleModuleData } from "reciple";

@setRecipleModule()
export class PingCommand implements RecipleModuleData {
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
     * Sets the commands
     */
    @setContextMenuCommand({ name: 'ping', type: ApplicationCommandType.Message })
    @setMessageCommand({ name: 'ping', description: 'Replies with pong!' })
    @setSlashCommand({ name: 'ping', description: 'Replies with pong!' })
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
