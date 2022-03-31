import { Message } from 'discord.js';
import { RecipleClient } from '../Client';


export interface CommandMessage {
    command?: string;
    args?: string[];
    raw?: string;
    prefix?: string;
    separator?: string;
}

export interface RecipleMessageCommandExecute {
    message: Message;
    command: CommandMessage;
    client: RecipleClient;
}

export class MessageCommandBuilder {
    public name?: string;
    public description?: string;
    public execute?: (options: RecipleMessageCommandExecute) => void = (options) => { /* Execute */ };

    public setName(name: string): MessageCommandBuilder {
        if (!name || typeof name !== 'string') throw new Error('name must be a string.');
        this.name = name;
        return this;
    }

    public setDescription(description: string): MessageCommandBuilder {
        if (!description || typeof name !== 'string') throw new Error('description must be a string.');
        this.description = description;
        return this;
    }

    public setExecute(execute: (options: RecipleMessageCommandExecute) => void): MessageCommandBuilder {
        if (!execute || typeof execute !== 'function') throw new Error('execute must be a function.');
        this.execute = execute;
        return this;
    }
}