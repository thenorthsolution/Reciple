import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { RecipleClient } from '../Client';

export interface RecipleInteractionCommandExecute {
    interaction: CommandInteraction;
    command: InteractionCommandBuilder;
    client: RecipleClient;
}

export class InteractionCommandBuilder extends SlashCommandBuilder {
    public execute: (options: RecipleInteractionCommandExecute) => void = (options) => { /* Execute */ };

    public setExecute(execute: (options: RecipleInteractionCommandExecute) => void): InteractionCommandBuilder {
        if (!execute || typeof execute !== 'function') throw new Error('execute must be a function.');
        this.execute = execute;
        return this;
    }
}