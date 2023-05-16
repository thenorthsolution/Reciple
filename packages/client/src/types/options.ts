import { MessageCommandResovable } from '../classes/builders/MessageCommandBuilder';
import { RecipleClient } from '../classes/RecipleClient';
import discordjs, { Message } from 'discord.js';
import { Logger } from 'fallout-utility';

export interface RecipleConfigOptions {
    token: string;
    cooldownSweeper?: {
        enabled?: boolean;
        interval?: number;
    };
    commands?: {
        contextMenuCommand?: Partial<RecipleCommandsInteractionBasedConfigOptions>;
        messageCommand?: Partial<RecipleCommandsConfigOptions & {
            commandArgumentSeparator: string;
            prefix: string;
        }>;
        slashCommand?: Partial<RecipleCommandsInteractionBasedConfigOptions>;
        additionalApplicationCommands?: Pick<Partial<RecipleCommandsInteractionBasedConfigOptions>, 'registerCommands'>;
    };
    applicationCommandRegister?: {
        enabled?: boolean;
        registerToGuilds?: string[];
        allowRegisterGlobally?: boolean;
        /**
         * @deprecated This sounds wrong so deprecated. use **allowRegisterToGuilds** property instead
         */
        allowRegisterOnGuilds?: boolean;
        allowRegisterToGuilds?: boolean;
        registerEmptyCommands?: boolean;
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
    recipleOptions: Partial<RecipleConfigOptions> & { token: string; };
    logger?: Logger;
}

export interface MessageCommandValidateOptionData {
    message: Message;
    client: RecipleClient;
    command: MessageCommandResovable;
    args: string[];
}
