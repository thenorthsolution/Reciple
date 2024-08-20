// @ts-check
import { MessageCommandBuilder } from "reciple";
import { codeBlock } from "discord.js";

export class Message {
    commands = [
        new MessageCommandBuilder()
            .setName('flag')
            .setDescription('Sends a message')
            .addFlag(flag => flag
                .setName('flag')
                .setDescription('A flag')
                .setValueType('string')
                .setRequired(true)
            )
            .addFlag(flag => flag
                .setName('boolean')
                .setShortcut('b')
                .setDescription('A boolean')
                .setValueType('boolean')
            )
            .addOption(option => option
                .setName('option')
                .setDescription('An option')
                .setRequired(true)
            )
            .setExecute(async ({ message, options, flags }) => {
                await message.reply(codeBlock('json', JSON.stringify({
                    flag: flags.getFlagValues('flag', { required: true, type: 'string' })[0],
                    boolean: flags.getFlagValues('boolean', { required: false, type: 'boolean' })[0],
                    option: options.getOptionValue('option', { required: true }),
                }, null, 2)));
            })
    ];

    onStart() {
        return true;
    }
}

export default new Message()
