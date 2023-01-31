import discordjs, { Message } from 'discord.js';
import { RecipleClient } from '../classes/RecipleClient';
import { MessageCommandResovable } from '../classes/builders/MessageCommandBuilder';

export interface RecipleConfigOptions {
    token: string;
    commands: {
        contextMenuCommand: RecipleCommandsInteractionBasedConfigOptions;
        slashCommand: RecipleCommandsInteractionBasedConfigOptions;
        messageCommand: RecipleCommandsConfigOptions & {
            commandArgumentSeparator: string;
            prefix: string;
        };
        additionalApplicationCommands: Pick<RecipleCommandsInteractionBasedConfigOptions, 'registerCommands'>;
    };
    applicationCommandRegister: {
        allowRegisterGlobally: boolean;
        allowRegisterOnGuilds: boolean;
        registerEmptyCommands: boolean;
    };
    client: discordjs.ClientOptions;
}

export interface RecipleCommandsConfigOptions {
    enabled: boolean;
    enableCooldown: boolean;
}

export interface RecipleCommandsInteractionBasedConfigOptions extends RecipleCommandsConfigOptions {
    registerCommands: {
        registerGlobally: boolean;
        registerToGuilds: string[];
    };
    acceptRepliedInteractions: boolean;
}

export interface RecipleClientOptions extends discordjs.ClientOptions {
    recipleOptions: Partial<RecipleConfigOptions>;
}

export interface MessageCommandValidateOptionData {
    message: Message;
    client: RecipleClient;
    command: MessageCommandResovable;
    args: string[];
}
