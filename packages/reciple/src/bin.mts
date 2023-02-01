import { existsSync, mkdirSync, readdirSync } from 'fs';
import { command, cwd } from './utils/cli.js';
import { path } from 'fallout-utility';
import micromatch from 'micromatch';
import promptConfirm from '@inquirer/confirm';
import { Config } from './classes/Config.js';
import { CommandType, ContextMenuCommandBuilder, MessageCommandBuilder, RecipleClient, SlashCommandBuilder, realVersion } from '@reciple/client';
import { createLogger, eventLogger } from './utils/logger.js';
import { getModules } from './utils/modules.js';

const flags = command.parse().opts();

const allowedFiles = ['node_modules', 'reciple.yml', 'package.json', '.*'];
const configPath = flags.config ?? path.join(cwd, 'reciple.yml');

if (!existsSync(cwd)) mkdirSync(cwd, { recursive: true });
if (readdirSync(cwd).filter(f => !micromatch.isMatch(f, allowedFiles)).length && !existsSync(configPath) && !flags.yes) {
    const confirm = await promptConfirm(
        {
            default: false,
            message: 'Would you like to create Reciple config here?'
        }
    );

    if (!confirm) process.exit(0);
}

const configParser = await (new Config(configPath)).parseConfig();
const config = configParser.getConfig();
const client = new RecipleClient({
    recipleOptions: config,
    ...config.client,
    logger: config.logger.enabled ? createLogger(config.logger) : undefined
});

client.logger?.info('Starting Reciple client v' + realVersion);

eventLogger(client);

await client.modules.loadModules({
    modules: await client.modules.resolveModuleFiles(await getModules(config.modules, file => file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.cjs')), config.modules.disableModuleVersionCheck),
    addToModulesCollection: true
});

client.once('ready', async () => {
    const startedModules = await client.modules.startModules({
        modules: client.modules.modules.toJSON(),
        resolveCommands: true
    });

    client.modules.modules.sweep(m => !startedModules.some(s => s.id == m.id));

    const unloadModulesAndStopProcess = async (signal: NodeJS.Signals) => {
        await client.modules.unloadModules({
            reason: 'ProcessExit',
            modules: client.modules.modules.toJSON(),
            removeCommandsFromClient: false,
            removeFromModulesCollection: true
        });


        client.logger?.warn(`Process exited ${signal === 'SIGINT' ? ': keyboard interrupt' : signal === 'SIGTERM' ? ': terminate' : signal}`);
        process.exit();
    };

    process.once('SIGINT', signal => unloadModulesAndStopProcess(signal));
    process.once('SIGTERM', signal => unloadModulesAndStopProcess(signal));

    client.on('cacheSweep', () => client.cooldowns.clean());

    await client.commands.registerApplicationCommands();

    client.logger?.warn(`Logged in as ${client.user?.tag} (${client.user?.id})`);

    client.on('interactionCreate', interaction => {
        if (interaction.isContextMenuCommand()) {
            ContextMenuCommandBuilder.execute(client, interaction);
        } else if (interaction.isChatInputCommand()) {
            SlashCommandBuilder.execute(client, interaction);
        }
    });

    client.on('messageCreate', message => {
        MessageCommandBuilder.execute(client, message);
    });
});
