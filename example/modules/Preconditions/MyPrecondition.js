// @ts-check

/**
 * @type {import("reciple").CommandPreconditionData}
 */
export default {
    id: 'command.precondition.lol',
    disabled: false,
    contextMenuCommandExecute: execute => {
        return true;
    },
    messageCommandExecute: excute => {
        return true;
    },
    slashCommandExecute: execute => {
        return true;
    }
};
