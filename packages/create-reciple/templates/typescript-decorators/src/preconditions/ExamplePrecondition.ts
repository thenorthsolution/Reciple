import { CommandPreconditionData, ContextMenuCommandExecuteData, MessageCommandExecuteData, SlashCommandExecuteData } from 'reciple';

export class ExamplePrecondition implements CommandPreconditionData {
    id = 'my.reciple.js.exampleprecondition';
    disabled = false;

    contextMenuCommandExecute(execute: ContextMenuCommandExecuteData) {
        return true;
    }

    messageCommandExecute(excute: MessageCommandExecuteData) {
        return true;
    }

    slashCommandExecute(execute: SlashCommandExecuteData) {
        return true;
    }
}
