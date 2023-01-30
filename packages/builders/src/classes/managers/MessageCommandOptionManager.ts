import { Collection } from 'discord.js';
import { MessageCommandOptionValue } from '../builders/MessageCommandOptionBuilder';

export class MessageCommandOptionManager extends Collection<string, MessageCommandOptionValue> {}
