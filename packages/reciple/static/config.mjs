import { IntentsBitField } from 'discord.js';
import { version } from '@reciple/core';

// @ts-check

/**
 * @type {import('reciple').RecipleConfig}
 */
export const config = {
    token: process.env.TOKEN ?? '',
    commands: {
        contextMenuCommands: {
            enabled: true,
            enableCooldown: true,
            acceptRepliedInteractions: false,
            registerCommands: {
                registerGlobally: true,
                registerToGuilds: []
            }
        },
        messageCommand: {
            enabled: true,
            enableCooldown: true,
            commandArgumentSeparator: ' ',
            prefix: '!'
        },
        slashCommand: {
            enabled: true,
            enableCooldown: true,
            acceptRepliedInteractions: false,
            registerCommands: {
                registerGlobally: true,
                registerToGuilds: []
            }
        }
    },
    applicationCommandRegister: {
        enabled: true,
        allowRegisterGlobally: true,
        allowRegisterToGuilds: true,
        registerEmptyCommands: true,
        registerToGuilds: []
    },
    client: {
        intents: [
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.GuildMembers,
            IntentsBitField.Flags.GuildMessages,
            IntentsBitField.Flags.MessageContent,
        ]
    },
    logger: {
        enabled: true,
        debugmode: null,
        coloredMessages: true,
        disableLogPrefix: false,
        logToFile: {
            enabled: true,
            logsFolder: './logs',
            file: 'latest.log'
        }
    },
    modules: {
        dirs: ['./modules'],
        exclude: [],
        disableModuleVersionCheck: false
    },
    cooldownSweeperOptions: {
        timer: 1000 * 60 * 60
    },
    checkForUpdates: true,
    version: `^${version}`
};
