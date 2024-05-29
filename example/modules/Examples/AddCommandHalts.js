/**
 * This module adds halt function to every loaded command
 */

// @ts-check
import { inlineCode, time } from "discord.js";
import { CommandHaltReason, CommandPermissionsPrecondition, CommandPermissionsPreconditionTriggerDataType, CommandType } from "reciple";


/**
 * @satisfies {import("reciple").RecipleModuleData}
 */
export default {
    versions: '^9',
    commands: [],
    onStart() {
        return true;
    },
    onLoad({ client }) {
        client.modules.once('loadedModules', async () => {
            const commands = [...client.commands.contextMenuCommands.values(), ...client.commands.messageCommands.values(), ...client.commands.slashCommands.values()];
            await this.addHaltToCommands(commands);
        });
    },
    /**
     * 
     * @param {import("reciple").AnyCommandBuilder[]} commands
     */
    async addHaltToCommands(commands) {
        for (const command of commands) {
            const orginalHalt = command.halt;
            const newHalt = async haltData => {
                const handled = orginalHalt ? await orginalHalt(haltData) : false;
                if (handled) return true;

                return this.handleCommandHalt(haltData);
            };

            command.setHalt(newHalt);
        }
    },
    /**
     * 
     * @param {import("reciple").AnyCommandHaltData} haltData 
     * @returns {Promise<boolean>}
     */
    async handleCommandHalt(haltData) {
        const createResponse = haltData.commandType === CommandType.MessageCommand
            ?
            /**
             * @param {import("discord.js").BaseMessageOptions & { ephemeral: boolean }} options
             */
            options => haltData.executeData.message.reply(options)
            : haltData.executeData.interaction.deferred
                ?
                /**
                 * @param {import("discord.js").BaseMessageOptions} options
                 */
                options => haltData.executeData.interaction.editReply(options)
                : haltData.executeData.interaction.replied
                    ?
                    /**
                     * @param {import("discord.js").BaseMessageOptions} options
                     */
                    options => haltData.executeData.interaction.followUp(options)
                    :
                    /**
                     * @param {import("discord.js").BaseMessageOptions} options
                     */
                    options => haltData.executeData.interaction.reply(options);
        /**
         * @type {import("discord.js").BaseMessageOptions & { ephemeral: boolean }}
         */
        let replyOptions = { ephemeral: true };

        switch (haltData.reason) {
            case CommandHaltReason.Error:
                replyOptions.content = 'An error occured while executing this command';
                await createResponse(replyOptions);
                return true;
            case CommandHaltReason.Cooldown:
                replyOptions.content = `You can use this command again ${time(haltData.cooldown.endsAt, 'R')}`;
                await createResponse(replyOptions);
                return true;
            case CommandHaltReason.InvalidArguments:
                const invalidArgs = haltData.invalidOptions.map(a => inlineCode(a.name));
                replyOptions.content = `Invalid value given to option(s) ${invalidArgs.join(' ')}`;
                createResponse(replyOptions);
                return true;
            case CommandHaltReason.MissingArguments:
                const missingArgs = haltData.missingOptions.map(a => inlineCode(a.name));
                replyOptions.content = `Missing required argument(s) ${missingArgs.join(' ')}`;
                createResponse(replyOptions);
                return true;
            case CommandHaltReason.PreconditionTrigger:
                if (CommandPermissionsPrecondition.isPermissionsPreconditionData(haltData.data)) {
                    preconditionSwitch: switch (haltData.data.data?.type) {
                        case CommandPermissionsPreconditionTriggerDataType.BotNotAllowed: return true;
                        case CommandPermissionsPreconditionTriggerDataType.ClientNotEnoughPermissions:
                            replyOptions.content = `Bot requires ${haltData.data.data.requiredPermissions.toArray().map(p => inlineCode(p)).join(' ')} permission(s) to execute this command`;
                            break preconditionSwitch;
                        case CommandPermissionsPreconditionTriggerDataType.MemberNotEnoughPermissions:
                            replyOptions.content = `You doesn't have ${haltData.data.data.requiredPermissions.toArray().map(p => inlineCode(p)).join(' ')} permission(s) to execute this command`;
                            break preconditionSwitch;
                        case CommandPermissionsPreconditionTriggerDataType.NoDmPermission: return true;
                    }

                    createResponse(replyOptions);
                    return true;
                }
        }

        return true;
    }
};
