// @ts-check
import { inlineCode } from 'discord.js';
import { CommandHaltReason } from 'reciple';

/**
 * @satisfies {import('reciple').CommandHaltData}
 */
export class MessageCommandArguments {
    id = 'org.reciple.js.messageargs';

    /**
     * 
     * @param {import('reciple').MessageCommandHaltTriggerData} data 
     */
    async messageCommandHalt(data) {
        if (
            data.reason !== CommandHaltReason.InvalidArguments &&
            data.reason !== CommandHaltReason.MissingArguments &&
            data.reason !== CommandHaltReason.InvalidFlags &&
            data.reason !== CommandHaltReason.MissingFlags
        ) return;

        switch (data.reason) {
            case CommandHaltReason.InvalidArguments:
                await data.executeData.message.reply(`## Invalid arguments\n${data.executeData.options.invalidOptions.map(o => `- ${inlineCode(o.name)} ${o.error?.message ?? 'Invalid value'}`).join('\n')}`);
                break;
            case CommandHaltReason.MissingArguments:
                await data.executeData.message.reply(`## Missing arguments\n${data.executeData.options.missingOptions.map(o => `- ${inlineCode(o.name)}`).join('\n')}`);
                break;
            case CommandHaltReason.InvalidFlags:
                await data.executeData.message.reply(`## Invalid flags\n${data.executeData.flags.invalidFlags.map(o => `- ${inlineCode(o.name)} ${o.error?.message ?? 'Invalid value'}`).join('\n')}`);
                break;
            case CommandHaltReason.MissingFlags:
                await data.executeData.message.reply(`## Missing flags\n${data.executeData.flags.missingFlags.map(o => `- ${inlineCode(o.name)}`).join('\n')}`);
                break;
        }

        return true;
    }
};

export default new MessageCommandArguments();
