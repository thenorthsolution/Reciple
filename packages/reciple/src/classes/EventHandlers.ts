import { type RecipleClient } from '../index.js';
import { RecipleModule } from '@reciple/core';
import { kleur } from 'fallout-utility';

export class EventHandlers {
    private constructor() {}

    public static addClientEvents(client: RecipleClient): void {
        client.on('recipleDebug', debug => client.logger?.debug(debug));

        client.modules.on('resolveModuleFileError', (file, error) => client.logger?.error(`Failed to resolve module ${kleur.yellow(EventHandlers.quoteString(file))}:`, error));

        client.modules.on('preStartModule', (m) => {
            if (!RecipleModule.getModuleRoot(m)) Reflect.set(m, 'root', cli.cwd);
            client.logger?.debug(`Starting module ${kleur.cyan(EventHandlers.quoteString(m.displayName))}`);
        });

        client.modules.on('postStartModule', (m) => client.logger?.log(`Started module ${kleur.cyan(EventHandlers.quoteString(m.displayName))}`));
        client.modules.on('startModuleError', (m, err) => client.logger?.error(`Failed to start module ${kleur.yellow(EventHandlers.quoteString(m.displayName))}:`, err));

        client.modules.on('preLoadModule', (m) => client.logger?.debug(`Loading module ${kleur.cyan(EventHandlers.quoteString(m.displayName))}`));
        client.modules.on('postLoadModule', (m) => client.logger?.log(`Loaded module ${kleur.cyan(EventHandlers.quoteString(m.displayName))}`));
        client.modules.on('loadModuleError', (m, err) => client.logger?.error(`Failed to load module ${kleur.yellow(EventHandlers.quoteString(m.displayName))}:`, err));

        client.modules.on('preUnloadModule', (m) => client.logger?.debug(`Unloading module ${kleur.cyan(EventHandlers.quoteString(m.displayName))}`));
        client.modules.on('postUnloadModule', (m) => client.logger?.log(`Unloaded module ${kleur.cyan(EventHandlers.quoteString(m.displayName))}`));
        client.modules.on('unloadModuleError', (m, err) => client.logger?.error(`Failed to unload module ${kleur.yellow(EventHandlers.quoteString(m.displayName))}:`, err));

        client.on('recipleRegisterApplicationCommands', (commands, guild) => client.logger?.log(`Registered (${commands?.size || 0}) application commands ${guild ? 'to ' + guild : 'globally'}`));
    }

    public static addCommandExecuteHandlers(client: RecipleClient): void {
        client.on('interactionCreate', async interaction => {
            if (interaction.isChatInputCommand()) await client.commands?.execute(interaction);
            if (interaction.isContextMenuCommand()) await client.commands?.execute(interaction);
        });

        client.on('messageCreate', async message => {
            await client.commands?.execute(message);
        });
    }

    private static quoteString(string: string, quote: string = "'"): string {
        return `${quote}${string}${quote}`;
    }

    public static addExitListener(listener: (signal: NodeJS.Signals) => any, once?: boolean): void {
        if (!once) {
            process.on('SIGHUP', listener);
            process.on('SIGINT', listener);
            process.on('SIGQUIT', listener);
            process.on('SIGABRT', listener);
            process.on('SIGALRM', listener);
            process.on('SIGTERM', listener);
            process.on('SIGBREAK', listener);
            process.on('SIGUSR2', listener);
        } else {
            process.once('SIGHUP', listener);
            process.once('SIGINT', listener);
            process.once('SIGQUIT', listener);
            process.once('SIGABRT', listener);
            process.once('SIGALRM', listener);
            process.once('SIGTERM', listener);
            process.once('SIGBREAK', listener);
            process.once('SIGUSR2', listener);
        }
    }

    public static removeExitListener(listener: (signal: NodeJS.Signals) => any): void {
        process.removeListener('SIGHUP', listener);
        process.removeListener('SIGINT', listener);
        process.removeListener('SIGQUIT', listener);
        process.removeListener('SIGABRT', listener);
        process.removeListener('SIGALRM', listener);
        process.removeListener('SIGTERM', listener);
        process.removeListener('SIGBREAK', listener);
        process.removeListener('SIGUSR2', listener);
    }
}
