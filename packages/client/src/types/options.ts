import { Logger } from 'fallout-utility';
import { MessageCommandResovable } from '../classes/builders/MessageCommandBuilder';
import { RecipleClient } from '../classes/RecipleClient';
import discordjs, { Message } from 'discord.js';

export interface RecipleConfigOptions {
    token: string;
    commands: {
        contextMenuCommand: RecipleCommandsInteractionBasedConfigOptions;
        messageCommand: RecipleCommandsConfigOptions & {
            commandArgumentSeparator: string;
            prefix: string;
        };
        slashCommand: RecipleCommandsInteractionBasedConfigOptions;
        additionalApplicationCommands: Pick<RecipleCommandsInteractionBasedConfigOptions, 'registerCommands'>;
    };
    applicationCommandRegister: {
        allowRegisterGlobally: boolean;
        allowRegisterOnGuilds: boolean;
        registerEmptyCommands: boolean;
    };
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
    logger?: Logger;
}

export interface MessageCommandValidateOptionData {
    message: Message;
    client: RecipleClient;
    command: MessageCommandResovable;
    args: string[];
}
