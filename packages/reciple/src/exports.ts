export * from './classes/Config';
export * from './utils/cli';
export * from './utils/logger';
export * from './utils/modules';

export interface ProcessInformation {
    type: 'ProcessInfo';
    pid: number;
    threadId: number;
    log?: string;
}
