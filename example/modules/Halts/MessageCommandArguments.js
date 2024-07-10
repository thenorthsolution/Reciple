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
        if (data.reason !== CommandHaltReason.InvalidArguments && data.reason !== CommandHaltReason.MissingArguments) return;
        console.log(data.executeData.options.invalidOptions);
        console.log(data.executeData.options.missingOptions);

        switch (data.reason) {
            case CommandHaltReason.InvalidArguments:
                await data.executeData.message.reply(`## Invalid arguments\n${data.executeData.options.invalidOptions.map(o => `- ${inlineCode(o.name)} ${o.error?.message ?? 'Invalid value'}`).join('\n')}`);
                break;
            case CommandHaltReason.MissingArguments:
                await data.executeData.message.reply(`## Missing arguments\n${data.executeData.options.missingOptions.map(o => `- ${inlineCode(o.name)}`).join('\n')}`);
                break;
        }

        return true;
    }
};

export default new MessageCommandArguments();
