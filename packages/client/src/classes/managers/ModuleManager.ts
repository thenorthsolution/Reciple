import { Client } from '../Client';

export interface ModuleManagerOptions {
    client: Client;
    modules?: any[];
}

export class ModuleManager {
    readonly client: Client;

    constructor(option: ModuleManagerOptions) {
        this.client = option.client;
    }
}
