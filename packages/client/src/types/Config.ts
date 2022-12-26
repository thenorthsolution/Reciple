import { ClientOptions } from 'discord.js';

export interface Config {
    token: string;
    commands: {
        slashCommand: {
            enabled: boolean;
            replyOnError: boolean;
            registerCommands: boolean;
            allowRegisterEmptyCommandList: boolean;
            setRequiredPermissions: boolean;
            acceptRepliedInteractions: boolean;
            useLegacyPermissionsChecking: boolean;
            guilds?: string[] | string;
        };
        messageCommand: {
            enabled: boolean;
            prefix?: string;
            replyOnError: boolean;
            commandArgumentSeparator: string;
        };
    };
    client: ClientOptions;
    messages: {
        [messageKey: string]: any;
    };
    disableModuleVersionCheck: boolean;
    version: string;
}
