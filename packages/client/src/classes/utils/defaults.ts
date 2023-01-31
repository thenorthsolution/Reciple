import { RecipleConfigOptions } from '../../types/options';

export const defaultRecipleConfigOptions: RecipleConfigOptions = {
    token: '',
    commands: {
        contextMenuCommand: {
            enabled: true,
            acceptRepliedInteractions: true,
            enableCooldown: true,
            registerCommands: {
                registerGlobally: true,
                registerToGuilds: []
            }
        },
        messageCommand: {
            enabled: true,
            prefix: '!',
            enableCooldown: true,
            commandArgumentSeparator: ' ',
        },
        slashCommand: {
            enabled: true,
            acceptRepliedInteractions: true,
            enableCooldown: true,
            registerCommands: {
                registerGlobally: true,
                registerToGuilds: []
            }
        },
        additionalApplicationCommands: {
            registerCommands: {
                registerGlobally: true,
                registerToGuilds: []
            }
        }
    },
    applicationCommandRegister: {
        allowRegisterGlobally: true,
        allowRegisterOnGuilds: false,
        registerEmptyCommands: true
    },
    client: {
        intents: [
            'Guilds',
            'GuildMessages'
        ]
    }
};
