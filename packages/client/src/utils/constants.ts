import { readFileSync } from 'fs';
import { RecipleConfigOptions } from '../types/options';
import { path } from 'fallout-utility';
import semver from 'semver';

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
    }
};

export const realVersion = JSON.parse(readFileSync(path.join(__dirname, '../../package.json'), 'utf-8')).version;
export const version = `${semver.coerce(realVersion)}`;
