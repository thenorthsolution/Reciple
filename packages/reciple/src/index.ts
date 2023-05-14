import yaml from 'yaml';
import { IConfig } from './classes/Config';
import { RecipleClient as Client, RecipleClientOptions } from '@reciple/client';

export * from '@reciple/client';
export * from './exports';

export {
    /**
     * Exports the `yaml` package used for parsing yml files
     */
    yaml
};

export declare class RecipleClient<Ready extends boolean = boolean> extends Client<Ready> {
    config: RecipleClientOptions["recipleOptions"] & Partial<IConfig>;
}
