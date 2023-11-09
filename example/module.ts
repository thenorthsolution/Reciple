import { CommandType, type RecipleModuleData } from 'reciple';

export class ExampleModule implements RecipleModuleData {
    public versions = ['^8'];
    public commands = [
        {
            command_type: CommandType.ContextMenuCommand,
            name: 'Test',
            type: 'Message',
            async execute({ interaction }) {
                await interaction.reply('Hello');
            }
        } as const,
        {
            command_type: CommandType.MessageCommand,
            name: 'test',
            description: 'Test command',
            async execute({ message }) {
                await message.reply('Hello');
            }
        } as const,
        {
            command_type: CommandType.SlashCommand,
            name: 'test',
            description: 'Test command',
            async execute({ interaction }) {
                await interaction.reply('Hello');
            }
        } as const
    ];

    onStart() {
        return true;
    }
}

export default new ExampleModule();
