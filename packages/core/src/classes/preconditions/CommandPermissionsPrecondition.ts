import { CommandPrecondition, CommandPreconditionData, CommandPreconditionTriggerData } from '../structures/CommandPrecondition';
import { Guild, GuildBasedChannel, GuildMemberResolvable, Message, PermissionResolvable, PermissionsBitField } from 'discord.js';
import { CommandPermissionsPreconditionTriggerDataType, CommandType } from '../../types/constants';
import { ContextMenuCommandExecuteData } from '../builders/ContextMenuCommandBuilder';
import { MessageCommandExecuteData } from '../builders/MessageCommandBuilder';
import { SlashCommandExecuteData } from '../builders/SlashCommandBuilder';
import { AnyCommandExecuteData } from '../../types/structures';

export class CommandPermissionsPrecondition extends CommandPrecondition {
    public static id: string = 'org.reciple.js.cmdpermissions';
    public static data: CommandPreconditionData = {
        id: CommandPermissionsPrecondition.id,
        disabled: false,
        contextMenuCommandExecute: () => true,
        messageCommandExecute: (data, precondition) => CommandPermissionsPrecondition._execute(data, precondition),
        slashCommandExecute: () => true,
    };

    private static async _execute(data: MessageCommandExecuteData|SlashCommandExecuteData|ContextMenuCommandExecuteData, precondition: CommandPermissionsPrecondition): Promise<boolean|CommandPreconditionTriggerData> {
        const requiredBotPermissions = data.builder.required_bot_permissions;
        const requiredMemberPermissions = data.builder.required_member_permissions;
        const allowBot = 'allow_bot' in data.builder ? data.builder.allow_bot : false;
        const dmPermission = data.builder.dm_permission;

        const triggerData: CommandPermissionsPreconditionTriggerData<AnyCommandExecuteData> = {
            executeData: data,
            precondition,
            successful: false
        };

        if (data.type === CommandType.MessageCommand) {
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
                            requiredPermissions: new PermissionsBitField(member.permissionsIn(data.message.channel).missing(requiredMemberPermissions))
                        };

                        return triggerData;
                    }
                }
            }
        } else {
            if (data.interaction.inGuild()) {
                const guildOrChannel = data.interaction.guild
                    ?? data.interaction.channel
                    ?? await data.client.channels.fetch(data.interaction.channelId).then(c => c?.isTextBased() && !c.isDMBased() ? c : null)
                    ?? await data.client.guilds.fetch(data.interaction.guildId);

                if (requiredBotPermissions && !(await CommandPermissionsPrecondition.userHasPermissionsIn(guildOrChannel, requiredBotPermissions))) {
                    triggerData.message = `Bot doesn't have enough permissions to execute this command in this channel`;
                    triggerData.data = {
                        type: CommandPermissionsPreconditionTriggerDataType.ClientNotEnoughPermissions,
                        requiredPermissions: await CommandPermissionsPrecondition.getMissingPermissionsIn(guildOrChannel, requiredBotPermissions)
                    };

                    return triggerData;
                }
            }
        }

        return true;
    }

    public static async userHasPermissionsIn(guildOrChannel: Guild|GuildBasedChannel, requiredPermissions: PermissionResolvable, member?: GuildMemberResolvable): Promise<boolean> {
        let permissions: PermissionsBitField|null = null;

        const memberId = member instanceof Message ? member.author.id : typeof member === 'string' ? member : member?.id;

        if (guildOrChannel instanceof Guild) {
            permissions = (memberId ? await guildOrChannel.members.fetch(memberId) : await guildOrChannel.members.fetchMe()).permissions;
        } else {
            permissions = guildOrChannel.permissionsFor(memberId ?? guildOrChannel.client.user.id);
        }

        return !!permissions?.has(requiredPermissions);
    }

    public static async getMissingPermissionsIn(guildOrChannel: Guild|GuildBasedChannel, requiredPermissions: PermissionResolvable, member?: GuildMemberResolvable): Promise<PermissionsBitField> {
        let permissions: PermissionsBitField|null = null;

        const memberId = member instanceof Message ? member.author.id : typeof member === 'string' ? member : member?.id;

        if (guildOrChannel instanceof Guild) {
            permissions = (memberId ? await guildOrChannel.members.fetch(memberId) : await guildOrChannel.members.fetchMe()).permissions;
        } else {
            permissions = guildOrChannel.permissionsFor(memberId ?? guildOrChannel.client.user.id);
        }

        return new PermissionsBitField(permissions?.missing(requiredPermissions));
    }

    public static isCommandPermissionsPreconditionTriggerData(data: unknown): data is CommandPermissionsPreconditionTriggerData<AnyCommandExecuteData> {
        return ((data as CommandPermissionsPreconditionTriggerData<AnyCommandExecuteData>).precondition instanceof CommandPermissionsPrecondition);
    }

    public static create(): CommandPermissionsPrecondition {
        return new CommandPermissionsPrecondition(CommandPermissionsPrecondition.data);
    }
}

export interface CommandPermissionsPreconditionNotEnoughPermissionsTriggerData {
    type: CommandPermissionsPreconditionTriggerDataType.ClientNotEnoughPermissions|CommandPermissionsPreconditionTriggerDataType.MemberNotEnoughPermissions;
    requiredPermissions: PermissionsBitField;
}

export type CommandPermissionsPreconditionTriggerData<T extends AnyCommandExecuteData> = CommandPreconditionTriggerData<T, { type: Exclude<CommandPermissionsPreconditionTriggerDataType, CommandPermissionsPreconditionNotEnoughPermissionsTriggerData['type']>; }|CommandPermissionsPreconditionNotEnoughPermissionsTriggerData>;
