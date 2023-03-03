import { RecipleClient } from 'reciple';

export default {
    versions: [`^7`],
    commands: [],
    onStart(client: RecipleClient) {
        client.logger?.log(`Started Typescript module`);
        return true;
    },
    onLoad(client: RecipleClient) {
        client.logger?.log(`Loaded Typescript module`);
        return true;
    }
};
