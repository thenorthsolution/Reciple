import { CommandType } from 'reciple';

/**
 * @type {import('reciple').RecipleModuleScript}
 */
export default {
    versions: ['^7'], // Module supports reciple client version 7
    commands: [
        {
            commandType: CommandType.ContextMenuCommand,
            name: 'Test Context Menu',
            type: 'Message',
            execute: async data => data.interaction.reply(`Hello!`)
        },
        {
            commandType: CommandType.MessageCommand,
            name: 'test',
            description: `Test message command`,
            aliases: `t`,
            execute: async data => data.message.reply(`Test message command`)
        },
        {
            commandType: CommandType.SlashCommand,
            name: 'test',
            description: 'Test slash command',
            execute: 'e'
        }
    ],

    // Module resolved logic here (Bot not logged in)
    onStart(client) {
        return true;
    },

    // Module loaded logic here (Bot logged in)
    onLoad(client, module) {},

    // Unload logic here
    onUnload({ reason, client }) {}
};
