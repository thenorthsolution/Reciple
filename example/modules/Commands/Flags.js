import { MessageCommandBuilder } from "reciple";

export class Message {
    commands = [
        new MessageCommandBuilder()
            .setName('flag')
            .setDescription('Sends a message')
            .addFlag(flag => flag
                .setName('flag')
                .setDescription('A flag')
                .setAccept('string')
                .setRequired(true)
                .setMandatory(true)
            )
            .setExecute(async ({ message, flags }) => {
                await message.reply(flags.getFlagValues('flag')[0]);
            })
    ];

    onStart() {
        return true;
    }
}

export default new Message()
