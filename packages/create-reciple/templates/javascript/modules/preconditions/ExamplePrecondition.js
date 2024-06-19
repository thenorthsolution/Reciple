// @ts-check

export class ExamplePrecondition {
    id = 'my.reciple.js.exampleprecondition';
    disabled = false;

    /**
     * @param {import("reciple").ContextMenuCommandExecuteData} execute
     */
    contextMenuCommandExecute(execute) {
        return true;
    }

    /**
     * @param {import("reciple").MessageCommandExecuteData} excute
     */
    messageCommandExecute(excute) {
        return true;
    }

    /**
     * @param {import("reciple").SlashCommandExecuteData} execute
     */
    slashCommandExecute(execute) {
        return true;
    }
};
