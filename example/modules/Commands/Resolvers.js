// @ts-check
import { CommandType, MessageCommandBuilder } from 'reciple';
import { MessageCommandBooleanFlagBuilder, MessageCommandBooleanOptionBuilder, MessageCommandChannelFlagBuilder, MessageCommandChannelOptionBuilder, MessageCommandIntegerFlagBuilder, MessageCommandIntegerOptionBuilder, MessageCommandMessageFlagBuilder, MessageCommandMessageOptionBuilder, MessageCommandNumberFlagBuilder, MessageCommandNumberOptionBuilder, MessageCommandRoleFlagBuilder, MessageCommandRoleOptionBuilder, MessageCommandUserFlagBuilder, MessageCommandUserOptionBuilder } from '@reciple/message-command-utils';
import { ChannelType } from 'discord.js';

/**
 * @type {import('reciple').RecipleModuleData}
 */
export class Resolvers {
    commands = [
        new MessageCommandBuilder()
            .setName('user')
            .setDescription('Testing')
            .addOption(new MessageCommandUserOptionBuilder()
                .setName('user')
                .setDescription('The user to fetch')
            )
            .addFlag(new MessageCommandUserFlagBuilder()
                .setName('user')
                .setDescription('The user to fetch')
            )
            .setExecute(async ({ message, options, flags }) => {
                const option = await MessageCommandUserOptionBuilder.resolveOption('user', options);
                const flag = await MessageCommandUserFlagBuilder.resolveFlag('user', flags);
                await message.reply({
                    content: `Option value: ${option}\nFlag value: ${flag.map(user => user.toString()).join(' ')}`,
                    allowedMentions: {
                        parse: []
                    }
                });
            }),
        new MessageCommandBuilder()
            .setName('role')
            .setDescription('Testing')
            .addOption(new MessageCommandRoleOptionBuilder()
                .setName('role')
                .setDescription('The role to fetch')
            )
            .addFlag(new MessageCommandRoleFlagBuilder()
                .setName('role')
                .setDescription('The role to fetch')
            )
            .setExecute(async ({ message, options, flags }) => {
                const option = await MessageCommandRoleOptionBuilder.resolveOption('role', options);
                const flag = await MessageCommandRoleFlagBuilder.resolveFlag('role', flags);
                await message.reply({
                    content: `Option value: ${option}\nFlag value: ${flag.map(role => role.toString()).join(' ')}`,
                    allowedMentions: {
                        parse: []
                    }
                });
            }),
        new MessageCommandBuilder()
            .setName('channel')
            .setDescription('Testing')
            .addOption(new MessageCommandChannelOptionBuilder()
                .setName('channel')
                .setDescription('The channel to fetch')
                .setChannelTypes([ChannelType.GuildText])
            )
            .addFlag(new MessageCommandChannelFlagBuilder()
                .setName('channel')
                .setDescription('The channel to fetch')
                .setChannelTypes([ChannelType.GuildText])
            )
            .setExecute(async ({ message, options, flags }) => {
                const option = await MessageCommandChannelOptionBuilder.resolveOption('channel', options);
                const flag = await MessageCommandChannelFlagBuilder.resolveFlag('channel', flags);
                await message.reply({
                    content: `Option value: ${option}\nFlag value: ${flag.map(channel => channel.toString()).join(' ')}`,
                    allowedMentions: {
                        parse: []
                    }
                });
            }),
        new MessageCommandBuilder()
            .setName('boolean')
            .setDescription('Testing')
            .addOption(new MessageCommandBooleanOptionBuilder()
                .setName('boolean')
                .setDescription('The boolean to resolve')
            )
            .addFlag(new MessageCommandBooleanFlagBuilder()
                .setName('boolean')
                .setDescription('The boolean to resolve')
            )
            .setExecute(async ({ message, options, flags }) => {
                const option = await MessageCommandBooleanOptionBuilder.resolveOption('boolean', options);
                const flag = await MessageCommandBooleanFlagBuilder.resolveFlag('boolean', flags);
                await message.reply({
                    content: `Option value: ${option}\nFlag value: ${flag.join(' ')}`,
                    allowedMentions: {
                        parse: []
                    }
                });
            }),
        new MessageCommandBuilder()
            .setName('int')
            .setDescription('Testing')
            .addOption(new MessageCommandIntegerOptionBuilder()
                .setName('int')
                .setDescription('The int to resolve')
                .setMaxValue(10)
                .setMinValue(0)
            )
            .addFlag(new MessageCommandIntegerFlagBuilder()
                .setName('int')
                .setDescription('The int to resolve')
                .setMaxValue(10)
                .setMinValue(0)
            )
            .setExecute(async ({ message, options, flags }) => {
                const option = await MessageCommandIntegerOptionBuilder.resolveOption('int', options);
                const flag = await MessageCommandIntegerFlagBuilder.resolveFlag('int', flags);
                await message.reply({
                    content: `Option value: ${option}\nFlag value: ${flag}`,
                    allowedMentions: {
                        parse: []
                    }
                });
            }),
        new MessageCommandBuilder()
            .setName('number')
            .setDescription('Testing')
            .addOption(new MessageCommandNumberOptionBuilder()
                .setName('number')
                .setDescription('The number to resolve')
                .setMaxValue(10)
                .setMinValue(0)
            )
            .addFlag(new MessageCommandNumberFlagBuilder()
                .setName('number')
                .setDescription('The number to resolve')
                .setMaxValue(10)
                .setMinValue(0)
            )
            .setExecute(async ({ message, options, flags }) => {
                const option = await MessageCommandNumberOptionBuilder.resolveOption('number', options);
                const flag = await MessageCommandNumberFlagBuilder.resolveFlag('number', flags);
                await message.reply({
                    content: `Option value: ${option}\nFlag value: ${flag}`,
                    allowedMentions: {
                        parse: []
                    }
                });
            }),
        new MessageCommandBuilder()
            .setName('message')
            .setDescription('Testing')
            .addOption(new MessageCommandMessageOptionBuilder()
                .setName('message')
                .setDescription('The message to resolve')
                .setAllowBotMessages(false)
                .setAllowOutsideMessages(false)
            )
            .addFlag(new MessageCommandMessageFlagBuilder()
                .setName('message')
                .setDescription('The message to resolve')
                .setAllowBotMessages(false)
                .setAllowOutsideMessages(false)
            )
            .setExecute(async ({ message, options, flags }) => {
                const option = await MessageCommandMessageOptionBuilder.resolveOption('message', options);
                const flag = await MessageCommandMessageFlagBuilder.resolveFlag('message', flags);
                await message.reply({
                    content: `Option value: ${option?.toString()}\nFlag value: ${flag.map(message => message.toString()).join(' ')}`,
                    allowedMentions: {
                        parse: []
                    }
                });
            }),
    ];

    /**
     * 
     * @param {import('reciple').RecipleModuleStartData} param0 
     * @returns 
     */
    onStart({ client }) {
        client.on('recipleCommandExecute', async (data) => {
            if (data.type !== CommandType.MessageCommand) return;
        });

        return true;
    }
}

export default new Resolvers();
