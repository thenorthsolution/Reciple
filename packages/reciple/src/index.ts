import { IConfig } from './classes/Config';
import { RecipleClient as Client, RecipleClientOptions } from '@reciple/client';

export * from '@reciple/client';
export * from './exports';

export declare class RecipleClient<Ready extends boolean = boolean> extends Client<Ready> {
    config: RecipleClientOptions["recipleOptions"] & Partial<IConfig>;
}
