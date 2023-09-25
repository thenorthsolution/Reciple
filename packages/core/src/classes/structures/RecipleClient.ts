import { RecipleClientConfig } from '../../types/structures';
import { Client, ClientOptions } from 'discord.js';
import { CooldownManager } from '../managers/CooldownManager';
import { If } from 'fallout-utility';

export interface RecipleClientOptions extends RecipleClientConfig {
    client: ClientOptions;
}

export interface RecipleClient<Ready extends boolean = boolean> extends Client<Ready> {
    isReady(): this is RecipleClient<true>;
}

export class RecipleClient<Ready extends boolean = boolean> extends Client<Ready> {
    protected _cooldowns: CooldownManager|null = null;

    get cooldowns() { return this._cooldowns as If<Ready, CooldownManager>; }

    constructor(readonly config: RecipleClientOptions) {
        super(config.client);
    }

    public async login(): Promise<string> {
        this.once('ready', () => {
            if (!this.isReady()) return;

            this.cooldowns._createCooldownSweeper();
        });

        const token = await super.login();

        return token;
    }
}
