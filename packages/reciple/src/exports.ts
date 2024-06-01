export * from './classes/Config.js';
export * from './utils/modules.js';
export * from './utils/logger.js';
export * from './utils/cli.js';

export interface ProcessInformation {
    type: 'ProcessInfo';
    pid: number;
    threadId: number;
    log?: string;
}
