import discordjs from 'discord.js';

export interface RecipleConfigOptions {
    token: string;
    commands: {
        contextMenuCommand: RecipleCommandsInteractionBasedConfigOptions;
        slashCommand: RecipleCommandsInteractionBasedConfigOptions;
        messageCommand: RecipleCommandsConfigOptions & {
            commandArgumentSeparator: string;
        };
    };
    client: discordjs.ClientOptions;
}

export interface RecipleCommandsConfigOptions {
    enabled: boolean;
}

export interface RecipleCommandsInteractionBasedConfigOptions extends RecipleCommandsConfigOptions {
    registerCommands: boolean;
    allowRegisterEmptyCommandList: boolean;
    acceptRepliedInteractions: boolean;
    guilds: string[];
}

export interface RecipleClientOptions extends discordjs.ClientOptions {
    recipleOptions: RecipleConfigOptions;
}
