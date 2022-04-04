#!/bin/bash
import { RecipleConfig } from './reciple/classes/Config';
import { RecipleClient } from './reciple/classes/Client';
import { MessageCommandBuilder } from './reciple/classes/builders/MessageCommandBuilder';

const config = new RecipleConfig('./reciple.yml').parseConfig().getConfig();
const client = new RecipleClient({ config: config, ...config.client });

(async () => {
    await client.startModules();

    client.on('ready', async () => {
        client.logger.warn(`Logged in as ${client.user?.tag || 'Unknown'}!`);

        await client.loadModules();
        client.addCommandListeners();
    });

    client.login(config.token);
})();