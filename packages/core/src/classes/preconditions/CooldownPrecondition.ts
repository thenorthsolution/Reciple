import { AnyCommandExecuteData, CommandType, CooldownData } from '../..';
import { CommandPrecondition, CommandPreconditionData } from '../structures/CommandPrecondition';

export class CooldownPrecondition extends CommandPrecondition {
    public static id: string = 'org.reciple.js.cooldowns';
    public static data: CommandPreconditionData = {
        id: CooldownPrecondition.id,
        disabled: false,
        contextMenuCommandExecute: data => CooldownPrecondition._execute(data),
        slashCommandExecute: data => CooldownPrecondition._execute(data),
        messageCommandExecute: data => CooldownPrecondition._execute(data),
    };

    private static _execute(data: AnyCommandExecuteData): boolean {
        const duration = data.builder.cooldown;
        if (!duration) return true;

        const userId = data.type === CommandType.MessageCommand ? data.message.author.id : data.interaction.user.id;
        const guildId = (data.type === CommandType.MessageCommand ? data.message.guildId : data.interaction.guildId) ?? undefined;

        const cooldownData: Omit<CooldownData, 'endsAt'> = {
            commandType: data.builder.command_type,
            commandName: data.builder.name,
            userId,
            guildId
        };

        const cooldown = data.client.cooldowns.findCooldown(cooldownData);
        if (cooldown) return true;

        data.client.cooldowns.create({
            ...cooldownData,
            endsAt: new Date(Date.now() + duration)
        });

        return true;
    }

    private constructor(data: CommandPreconditionData) {
        super(data);
    }

    public static create(): CooldownPrecondition {
        return new CooldownPrecondition(CooldownPrecondition.data);
    }
}
