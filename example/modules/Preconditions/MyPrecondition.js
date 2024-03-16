// @ts-check

/**
 * @type {import("reciple").CommandPreconditionData}
 */
export default {
    id: 'command.precondition.lol',
    disabled: false,
    contextMenuCommandExecute: execute => {
        return false;
    },
    messageCommandExecute: excute => {
        return false;
    },
    slashCommandExecute: execute => {
        return false;
    }
};
