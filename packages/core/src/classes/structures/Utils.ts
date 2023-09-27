import { CommandType } from '../../types/constants';

export class Utils {
    private constructor() {}

    public static getCommandTypeName(commandType: CommandType): string {
        switch (commandType) {
            case CommandType.ContextMenuCommand:
                return 'Context Menu Command';
            case CommandType.MessageCommand:
                return 'Message Command';
            case CommandType.SlashCommand:
                return 'Slash Command';
        }
    }
}
