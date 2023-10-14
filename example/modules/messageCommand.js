import { CommandType, MessageCommandBuilder } from 'reciple';

/**
 * @type {import('reciple').RecipleModuleData}
 */
export default {
    versions: ['^8'],
    commands: [
        // Using builders
        new MessageCommandBuilder()
            .setName('say')
            .setDescription('Say something')
            .addOption(option => option
                .setName('text')
                .setDescription('Your message')
                .setRequired(true)
            )
            .setExecute(async ({ message, parserData }) => {
                const text = parserData.args.join(' ');

                await message.delete();
                await message.channel.send(text);
            }),

        // Raw command data
        {
            command_type: CommandType.MessageCommand,
            name: 'time',
            description: 'Get current time',
            execute: async ({ message }) => {
                await message.reply((new Date()).toString());
            }
        }
    ],
    onStart: () => true
};
