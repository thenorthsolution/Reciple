// @ts-check
import { fetchMentionOrId, getMentionId } from '@reciple/utils';
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
                const text = parserData.rawArgs;

                await message.delete();
                await message.channel.send(text);
            }),

        // Raw command data
        {
            command_type: CommandType.MessageCommand,
            name: 'avatar',
            description: 'Get user avatar',
            options: [
                {
                    name: 'user',
                    description: 'Target user',
                    required: true,
                    validate: value => !!getMentionId(value),
                    resolve_value: (value, message, client) => fetchMentionOrId({ user: value, client })
                }
            ],
            execute: async ({ message, options }) => {
                const user = await options.getOptionValue('user', { required: true, resolveValue: true });
                await message.reply({
                    files: [
                        user.displayAvatarURL()
                    ]
                });
            }
        }
    ],
    onStart: () => true
};
