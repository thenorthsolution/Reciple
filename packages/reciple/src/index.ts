import { RecipleClient as Client, type Logger } from '@reciple/core';
import type { RecipleConfig } from './classes/Config.js';

export * from '@reciple/core';
export * from './exports.js';

export { config as loadEnv } from 'dotenv';

export declare class RecipleClient<Ready extends boolean = boolean> extends Client<Ready> {
    readonly config: RecipleConfig;
}

declare global {
    var reciple: RecipleClient;
    var logger: Logger|undefined;
    var cli: typeof import('./utils/cli.js')['cli'];
}
