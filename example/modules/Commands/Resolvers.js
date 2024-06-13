// @ts-check
import { MessageCommandBuilder } from 'reciple';
import { MessageCommandBooleanOptionBuilder, MessageCommandChannelOptionBuilder, MessageCommandIntegerOptionBuilder, MessageCommandNumberOptionBuilder, MessageCommandRoleOptionBuilder, MessageCommandUserOptionBuilder } from '@reciple/message-command-utils';

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
                const user = await options.getOptionValue('user', { resolveValue: true });
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
                const role = await options.getOptionValue('role', { resolveValue: true });
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
            )
            .setExecute(async ({ message, options }) => {
                const channel = await options.getOptionValue('channel', { resolveValue: true });
                await message.reply({
                    content: `Fetched ${channel}`,
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
            )
            .setExecute(async ({ message, options }) => {
                const channel = await options.getOptionValue('channel', { resolveValue: true });
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
                const boolean = await options.getOptionValue('boolean', { resolveValue: true });
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
                .setMaxValue(10)
                .setMinValue(0)
                .setName('int')
                .setDescription('The int to resolve')
            )
            .setExecute(async ({ message, options }) => {
                const boolean = await options.getOptionValue('boolean', { resolveValue: true });
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
                .setMaxValue(10)
                .setMinValue(0)
                .setName('number')
                .setDescription('The number to resolve')
            )
            .setExecute(async ({ message, options }) => {
                const number = await options.getOptionValue('number', { resolveValue: true });
                await message.reply({
                    content: `Resolved ${number}`,
                    allowedMentions: {
                        parse: []
                    }
                });
            })
    ],
    onStart: () => true
};
