import { IConfig } from './classes/Config';
import { RecipleClient as Client } from '@reciple/client';

export * from '@reciple/client';
export * from './exports';

export declare class RecipleClient extends Client {
    config: IConfig;
}
