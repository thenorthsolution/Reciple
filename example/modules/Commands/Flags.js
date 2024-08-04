// @ts-check
import { MessageCommandBuilder } from "reciple";
import { createMessageCommandUsage } from '@reciple/message-command-utils';

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
                .setMandatory(true)
            )
            .setExecute(async ({ message, flags }) => {
                await message.reply(flags.getFlagValues('flag', { required: true, type: 'string' })[0]);
            })
    ];

    onStart() {
        logger.log(this.commands[0])
        logger.log(createMessageCommandUsage(this.commands[0]))
        return true;
    }
}

export default new Message()
