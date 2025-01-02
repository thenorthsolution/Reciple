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
            // Accepts interactions that are replied when enabled
            acceptRepliedInteractions: false,
            registerCommands: {
                // Register all context menu commands globally
                registerGlobally: true,
                // Register context menu commands to specific guilds
                registerToGuilds: []
            }
        },
        messageCommand: {
            enabled: true,
            enableCooldown: true,
            // Character that separates the command arguments in message commands
            commandArgumentSeparator: ' ',
            // Prefix that will trigger a certain message commands
            prefix: '!'
        },
        slashCommand: {
            enabled: true,
            enableCooldown: true,
            // Accepts interactions that are replied when enabled
            acceptRepliedInteractions: false,
            registerCommands: {
                // Register all slash commands globally
                registerGlobally: true,
                // Register slash commands to specific guilds
                registerToGuilds: []
            }
        }
    },
    applicationCommandRegister: {
        enabled: true,
        // Allow register all commands globally
        allowRegisterGlobally: true,
        // Allow register all commands to guilds
        allowRegisterToGuilds: true,
        // Allow empty commands to be registered
        registerEmptyCommands: true,
        // Register all commands to specific guilds
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
        // Directories to load modules from
        dirs: ['./modules', './modules/*', './modules/*/*'],
        // Directories to exclude from loading modules
        exclude: ['./modules/halts', './modules/preconditions', './modules/_*'],
        // Custom filter for loading modules
        filter: file => true,
        // Disable module version check when loading modules
        disableModuleVersionCheck: false
    },
    preconditions: [
        new CooldownPrecondition(),
        new CommandPermissionsPrecondition()
    ],
    commandHalts: [],
    cooldownSweeperOptions: {
        // Time in milliseconds to check for expired cooldowns
        timer: 1000 * 60 * 60
    },
    // Announce reciple updates when the bot starts
    checkForUpdates: true,
    // The version of the CLI that was used to generate the project
    version: `^${cliVersion}`
};

/**
 * @satisfies {import('reciple').RecipleConfigJS['sharding']}
 */
export const sharding = {
    mode: 'process'
}
