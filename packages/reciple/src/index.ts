import { RecipleClient as Client } from '@reciple/core';
import { RecipleConfig } from './classes/Config.js';

export * from '@reciple/core';
export * from './exports.js';

export { config as loadEnv } from 'dotenv';

export declare class RecipleClient<Ready extends boolean = boolean> extends Client<Ready> {
    readonly config: RecipleConfig;
}
