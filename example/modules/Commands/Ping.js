// @ts-check
import { MessageCommandBuilder } from 'reciple';

/**
 * @type {import('reciple').RecipleModuleData}
 */
export default {
    commands: [
        new MessageCommandBuilder()
            .setName('ping')
            .setDescription('Get bot pong')
            .setAliases('p', 'pong')
            .setRequiredBotPermissions('SendMessages')
            .setExecute(async ({ message }) => {
                const reply = await message.reply(`Ponging...`);

                await message.reply(`🏓 ${reply.createdAt.getTime() - Date.now()}ms`);
            })
    ],
    onStart: () => true
};
