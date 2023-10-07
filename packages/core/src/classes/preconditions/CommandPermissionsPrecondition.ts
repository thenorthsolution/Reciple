import { MessageCommandExecuteData } from '../builders/MessageCommandBuilder';
import { CommandPrecondition, CommandPreconditionData, CommandPreconditionTriggerData } from '../structures/CommandPrecondition';
import { Guild, GuildBasedChannel, PermissionResolvable, PermissionsBitField } from 'discord.js';
import { CommandPermissionsPreconditionTriggerDataType } from '../..';

export class CommandPermissionsPrecondition extends CommandPrecondition {
    public static id: string = 'org.reciple.js.cmdpermissions';
    public static data: CommandPreconditionData = {
        id: CommandPermissionsPrecondition.id,
        disabled: false,
        contextMenuCommandExecute: () => true,
        messageCommandExecute: (data, precondition) => CommandPermissionsPrecondition._execute(data, precondition),
        slashCommandExecute: () => true,
    };

    private static async _execute(data: MessageCommandExecuteData, precondition: CommandPermissionsPrecondition): Promise<boolean|CommandPreconditionTriggerData> {
        const requiredBotPermissions = data.builder.required_bot_permissions;
        const requiredMemberPermissions = data.builder.required_member_permissions;
        const allowBot = data.builder.allow_bot;
        const dmPermission = data.builder.dm_permission;

        const triggerData: CommandPermissionsPreconditionTriggerData = {
            executeData: data,
            precondition,
            successful: false
        };

        if (!allowBot && data.message.author.bot) {
            triggerData.message = 'Bot users cannot execute this message command';
            triggerData.data = { type: CommandPermissionsPreconditionTriggerDataType.BotNotAllowed };

            return triggerData;
        }

        if (!dmPermission && !data.message.inGuild()) {
            triggerData.message = 'Execute is not allowed outside a guild';
            triggerData.data = { type: CommandPermissionsPreconditionTriggerDataType.NoDmPermission };

            return triggerData;
        }

        if (data.message.inGuild()) {
            if (requiredBotPermissions && !(await CommandPermissionsPrecondition.userHasPermissionsIn(data.message.channel, requiredBotPermissions))) {
                triggerData.message = `Bot doesn't have enough permissions to execute this command in this channel`;
                triggerData.data = {
                    type: CommandPermissionsPreconditionTriggerDataType.ClientNotEnoughPermissions,
                    requiredPermissions: await CommandPermissionsPrecondition.getMissingPermissionsIn(data.message.channel, requiredBotPermissions)
                };

                return triggerData;
            }

            if (requiredMemberPermissions) {
                const member = await data.message.guild.members.fetch(data.message.author.id);

                if (!member.permissionsIn(data.message.channel).has(requiredMemberPermissions)) {
                    triggerData.message = `User doesn't have enough permissions to execute this command in this channel`;
                    triggerData.data = {
                        type: CommandPermissionsPreconditionTriggerDataType.MemberNotEnoughPermissions,
                        requiredPermissions: await CommandPermissionsPrecondition.getMissingPermissionsIn(data.message.channel, requiredMemberPermissions)
                    };

                    return triggerData;
                }
            }
        }

        return true;
    }

    public static async userHasPermissionsIn(guildOrChannel: Guild|GuildBasedChannel, userPermissions: PermissionResolvable): Promise<boolean> {
        let permissions: PermissionsBitField|null = null;

        if (guildOrChannel instanceof Guild) {
            permissions = (await guildOrChannel.members.fetchMe()).permissions;
        } else {
            permissions = guildOrChannel.permissionsFor(guildOrChannel.client.user.id);
        }

        return !!permissions?.has(userPermissions);
    }

    public static async getMissingPermissionsIn(guildOrChannel: Guild|GuildBasedChannel, requiredPermissions: PermissionResolvable): Promise<PermissionsBitField> {
        let permissions: PermissionsBitField|null = null;

        if (guildOrChannel instanceof Guild) {
            permissions = (await guildOrChannel.members.fetchMe()).permissions;
        } else {
            permissions = guildOrChannel.permissionsFor(guildOrChannel.client.user.id);
        }

        return new PermissionsBitField(permissions?.missing(requiredPermissions));
    }

    public static isCommandPermissionsPreconditionTriggerData(data: unknown): data is CommandPermissionsPreconditionTriggerData {
        return ((data as CommandPermissionsPreconditionTriggerData).precondition instanceof CommandPermissionsPrecondition);
    }

    public static create(): CommandPermissionsPrecondition {
        return new CommandPermissionsPrecondition(CommandPermissionsPrecondition.data);
    }
}

export interface CommandPermissionsPreconditionNotEnoughPermissionsTriggerData {
    type: CommandPermissionsPreconditionTriggerDataType.ClientNotEnoughPermissions|CommandPermissionsPreconditionTriggerDataType.MemberNotEnoughPermissions;
    requiredPermissions: PermissionsBitField;
}

export type CommandPermissionsPreconditionTriggerData = CommandPreconditionTriggerData<MessageCommandExecuteData, { type: Exclude<CommandPermissionsPreconditionTriggerDataType, CommandPermissionsPreconditionNotEnoughPermissionsTriggerData['type']>; }|CommandPermissionsPreconditionNotEnoughPermissionsTriggerData>;
