const { CommandHaltReason, ContextMenuCommandBuilder, RecipleClient, version } = require('reciple');
const { ApplicationCommandType } = require('discord.js');

class Module {
    versions = `^${version}`;
    commands = [
        new ContextMenuCommandBuilder()
            .setName('Test')
            .setType(ApplicationCommandType.User)
            .setCooldown(10000)
            .setExecute(async ({interaction}) => interaction.reply(`Context menu`))
            .setHalt(
                /**
                 * 
                 * @param {import('../../packages/reciple/src').ContextMenuCommandHaltData} data 
                 */
                async data => data.reason === CommandHaltReason.Cooldown ? data.executeData.interaction.reply(`Cooldown ends at ${data.cooldownData.endsAt}`) : undefined),
        {
            commandType: 2,
            name: 'test',
            description: 'Testing description',
            validateOptions: true,
            options: [
                {
                    name: 'option1',
                    description: 'A required option',
                    required: true
                },
                {
                    name: 'option2',
                    description: 'Optional option'
                },
                {
                    name: 'option3',
                    description: 'Optional validated',
                    validator: value => value === '3',
                }
            ],
            /**
             * 
             * @param {import('reciple').MessageCommandExecuteData} param0 
             * @returns 
             */
            execute: async ({message, options}) => {
                if (options.getOption('option1') === 'error') throw new Error('An example error');

                await message.reply('Test');
            },

            /**
             * @param {import('../../packages/reciple/src').MessageCommandHaltData} param0
             */
            halt: async ({ reason, executeData }) => {
                if (reason !== CommandHaltReason.Error) return;

                await executeData.message.reply(`An error occured!`);
                return true;
            }
        },
        {
            commandType: 3,
            name: 'test',
            description: 'A test command',
            execute: async ({interaction}) => interaction.reply('Test!')
        }
    ];

    /**
     * 
     * @param {RecipleClient} client 
     * @returns 
     */
    onStart(client) {
        client.on('recipleCommandHalt', data => client.logger?.log(`Command halt ${data.executeData.builder.name}: `, data));

        console.log(this);

        client.logger.warn(`Started module!`);
        return true;
    }

    /**
     * 
     * @param {RecipleClient} client 
     */
    onLoad(client) {
        client.logger.warn(`Loaded module!`);
    }
}

module.exports.default = {
    default: {
        default: {
            default: {
                default: {
                    default: new Module()
                }
            }
        }
    }
};
