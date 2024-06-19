// @ts-check
import { CooldownPrecondition, CommandPermissionsPrecondition } from 'reciple';
import { IntentsBitField } from 'discord.js';
import { cliVersion } from 'reciple';

/**
 * @satisfies {import('reciple').RecipleConfig}
 */
export const config = {
    token: process.env.TOKEN ?? '',
    commands: {
        contextMenuCommand: {
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
        dirs: ['./modules', './modules/*', './modules/*/*'],
        exclude: ['halts', 'preconditions', '_*'],
        filter: file => true,
        disableModuleVersionCheck: false
    },
    preconditions: [
        new CooldownPrecondition(),
        new CommandPermissionsPrecondition()
    ],
    commandHalts: [],
    cooldownSweeperOptions: {
        timer: 1000 * 60 * 60
    },
    checkForUpdates: true,
    version: `^${cliVersion}`
};
