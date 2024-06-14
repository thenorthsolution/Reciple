// @ts-check
import { MessageCommandBuilder } from 'reciple';
import { MessageCommandBooleanOptionBuilder, MessageCommandChannelOptionBuilder, MessageCommandIntegerOptionBuilder, MessageCommandMessageOptionBuilder, MessageCommandNumberOptionBuilder, MessageCommandRoleOptionBuilder, MessageCommandUserOptionBuilder } from '@reciple/message-command-utils';
import { ChannelType } from 'discord.js';

/**
 * @type {import('reciple').RecipleModuleData}
 */
export default {
    commands: [
        new MessageCommandBuilder()
            .setName('user')
            .setDescription('Testing')
            .addOption(new MessageCommandUserOptionBuilder()
                .setName('user')
                .setDescription('The user to fetch')
            )
            .setExecute(async ({ message, options }) => {
                const user = await MessageCommandUserOptionBuilder.resolveOption('user', options);
                await message.reply({
                    content: `Fetched ${user}`,
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
            .setExecute(async ({ message, options }) => {
                const role = await MessageCommandRoleOptionBuilder.resolveOption('role', options);
                await message.reply({
                    content: `Fetched ${role}`,
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
            .setExecute(async ({ message, options }) => {
                const channel = await MessageCommandChannelOptionBuilder.resolveOption('channel', options);
                await message.reply({
                    content: `Fetched ${channel}`,
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
            .setExecute(async ({ message, options }) => {
                const boolean = await MessageCommandBooleanOptionBuilder.resolveOption('boolean', options);
                await message.reply({
                    content: `Resolved ${boolean}`,
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
            .setExecute(async ({ message, options }) => {
                const boolean = await MessageCommandIntegerOptionBuilder.resolveOption('int', options);
                await message.reply({
                    content: `Resolved ${boolean}`,
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
            .setExecute(async ({ message, options }) => {
                const number = await MessageCommandNumberOptionBuilder.resolveOption('number', options);
                await message.reply({
                    content: `Resolved ${number}`,
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
            .setExecute(async ({ message, options }) => {
                const msg = await MessageCommandMessageOptionBuilder.resolveOption('message', options);
                await message.reply({
                    content: `Resolved ${msg?.url}`,
                    allowedMentions: {
                        parse: []
                    }
                });
            }),
    ],
    onStart: () => true
};
