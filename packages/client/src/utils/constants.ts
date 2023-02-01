import { readFileSync } from 'fs';
import { RecipleConfigOptions } from '../types/options';
import { path } from 'fallout-utility';

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
            'GuildMessages',
            'MessageContent'
        ]
    }
};

export const version = JSON.parse(readFileSync(path.join(__dirname, '../../package.json'), 'utf-8')).version;
