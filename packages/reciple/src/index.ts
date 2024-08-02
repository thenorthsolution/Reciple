import type { Logger } from 'prtyprnt';
import type { CLI } from './classes/CLI.js';
import { cli, logger } from './types/constants.js';
import { RecipleClient as Client } from '@reciple/core';
import type { RecipleConfig } from './types/structures.js';

export * from '@reciple/core';
export * from './exports.js';

global.cli = cli;
global.logger = logger;

export { config as loadEnv } from 'dotenv';

export declare class RecipleClient<Ready extends boolean = boolean> extends Client<Ready> {
    readonly config: RecipleConfig;
}

declare global {
    var cli: CLI;
    var logger: Logger;
    var reciple: RecipleClient;
}
