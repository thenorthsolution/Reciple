// @ts-check

/**
 * @satisfies {import("reciple").CommandPreconditionData}
 */
export class ExamplePrecondition {
    id = 'command.precondition.lol';
    disabled = false;

    contextMenuCommandExecute(execute) {
        return true;
    }

    messageCommandExecute(excute) {
        return true;
    }

    slashCommandExecute(execute) {
        return true;
    }
};

export default new ExamplePrecondition();
