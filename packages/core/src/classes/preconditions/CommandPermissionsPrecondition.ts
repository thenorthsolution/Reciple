import { CommandPrecondition, type CommandPreconditionData, type CommandPreconditionResultData } from '../structures/CommandPrecondition.js';
import { Guild, Message, PermissionsBitField, type GuildBasedChannel, type GuildMemberResolvable, type PermissionResolvable } from 'discord.js';
import { CommandPermissionsPreconditionResultDataType, CommandType } from '../../types/constants.js';
import type { ContextMenuCommandExecuteData } from '../builders/ContextMenuCommandBuilder.js';
import type { MessageCommandExecuteData } from '../builders/MessageCommandBuilder.js';
import type { SlashCommandExecuteData } from '../builders/SlashCommandBuilder.js';
import type { AnyCommandExecuteData } from '../../types/structures.js';

export class CommandPermissionsPrecondition extends CommandPrecondition {
    public static id: string = 'org.reciple.js.cmdpermissions';
    public static data: CommandPreconditionData = {
        id: CommandPermissionsPrecondition.id,
        disabled: false,
        contextMenuCommandExecute: (data, precondition) => CommandPermissionsPrecondition._execute(data, precondition),
        messageCommandExecute: (data, precondition) => CommandPermissionsPrecondition._execute(data, precondition),
        slashCommandExecute: (data, precondition) => CommandPermissionsPrecondition._execute(data, precondition),
    };

    constructor() {
        super(CommandPermissionsPrecondition.data);
    }

    private static async _execute(data: MessageCommandExecuteData|SlashCommandExecuteData|ContextMenuCommandExecuteData, precondition: CommandPermissionsPrecondition): Promise<boolean|CommandPreconditionResultData> {
        const requiredBotPermissions = data.builder.required_bot_permissions;
        const requiredMemberPermissions = data.builder.required_member_permissions;
        const allowBot = 'allow_bot' in data.builder ? data.builder.allow_bot : false;
        const dmPermission = data.builder.dm_permission;

        const triggerData: CommandPermissionsPreconditionResultData<AnyCommandExecuteData> = {
            executeData: data,
            precondition,
            successful: false
        };

        if (data.type === CommandType.MessageCommand) {
            if (!allowBot && data.message.author.bot) {
                triggerData.message = 'Bot users cannot execute this message command';
                triggerData.data = { type: CommandPermissionsPreconditionResultDataType.BotNotAllowed };

                return triggerData;
            }

            if (!dmPermission && !data.message.inGuild()) {
                triggerData.message = 'Execute is not allowed outside a guild';
                triggerData.data = { type: CommandPermissionsPreconditionResultDataType.NoDmPermission };

                return triggerData;
            }

            if (data.message.inGuild()) {
                if (requiredBotPermissions && !(await CommandPermissionsPrecondition.userHasPermissionsIn(data.message.channel, requiredBotPermissions))) {
                    triggerData.message = `Bot doesn't have enough permissions to execute this command in this channel`;
                    triggerData.data = {
                        type: CommandPermissionsPreconditionResultDataType.ClientNotEnoughPermissions,
                        requiredPermissions: await CommandPermissionsPrecondition.getMissingPermissionsIn(data.message.channel, requiredBotPermissions)
                    };

                    return triggerData;
                }

                if (requiredMemberPermissions) {
                    const member = await data.message.guild.members.fetch(data.message.author.id);

                    if (!member.permissionsIn(data.message.channel).has(requiredMemberPermissions)) {
                        triggerData.message = `User doesn't have enough permissions to execute this command in this channel`;
                        triggerData.data = {
                            type: CommandPermissionsPreconditionResultDataType.MemberNotEnoughPermissions,
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
                        type: CommandPermissionsPreconditionResultDataType.ClientNotEnoughPermissions,
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

    public static isPermissionsPreconditionData<T extends AnyCommandExecuteData = AnyCommandExecuteData>(data: unknown): data is CommandPermissionsPreconditionResultData<T> {
        return ((data as CommandPermissionsPreconditionResultData<T>).precondition instanceof CommandPermissionsPrecondition);
    }
}

export interface CommandPermissionsPreconditionNotEnoughPermissionsResultData {
    type: CommandPermissionsPreconditionResultDataType.ClientNotEnoughPermissions|CommandPermissionsPreconditionResultDataType.MemberNotEnoughPermissions;
    requiredPermissions: PermissionsBitField;
}

export type CommandPermissionsPreconditionResultData<T extends AnyCommandExecuteData> = CommandPreconditionResultData<T, { type: Exclude<CommandPermissionsPreconditionResultDataType, CommandPermissionsPreconditionNotEnoughPermissionsResultData['type']>; }|CommandPermissionsPreconditionNotEnoughPermissionsResultData>;
