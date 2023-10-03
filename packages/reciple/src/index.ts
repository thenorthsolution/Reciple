import { RecipleClient as Client } from '@reciple/core';
import { RecipleConfig } from './classes/Config';
import { Logger } from 'fallout-utility';

export * from '@reciple/core';
export * from './exports';

export declare class RecipleClient<Ready extends boolean = boolean> extends Client<Ready> {
    readonly config: RecipleConfig;
    readonly logger?: Logger;
}
