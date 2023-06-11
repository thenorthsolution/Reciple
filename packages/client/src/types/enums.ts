import { Events } from 'discord.js';

enum RecipleEvents {
    RecipleCommandExecute = 'recipleCommandExecute',
    RecipleCommandHalt = 'recipleCommandHalt',
    RecipleCommandPrecondition = 'recipleCommandPrecondition',
    RecipleRegisterApplicationCommands = 'recipleRegisterApplicationCommands',
    RecipleError = 'recipleError',
    RecipleDebug = 'recipleDebug',
}

export const ClientEvents: (typeof Events) & (typeof RecipleEvents) = Object.assign({}, Events, RecipleEvents);
