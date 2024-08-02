import type { Logger, RecipleClientConfig } from '@reciple/core';
import type { Awaitable } from 'discord.js';

export interface CLIDefaultFlags {
    cwd: string;
    env: string[];
    debug: boolean;
}

export interface RecipleConfig extends RecipleClientConfig {
    logger?: {
        enabled: boolean;
        debugmode?: boolean|null;
        coloredMessages: boolean;
        disableLogPrefix: boolean;
        logToFile: {
            enabled: boolean;
            logsFolder: string;
            file: string;
        };
    }|Logger;
    modules?: {
        dirs: string[];
        exclude?: string[];
        filter?: (file: string) => Awaitable<boolean>;
        sort?: (a: string, b: string) => number;
        disableModuleVersionCheck?: boolean;
    };
    checkForUpdates?: boolean;
    version?: string;
}

export interface ProcessInformation {
    type: 'ProcessInfo';
    pid: number;
    threadId: number;
    log?: string;
}
