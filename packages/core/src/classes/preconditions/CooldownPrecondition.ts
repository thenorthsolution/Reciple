import { CommandPrecondition, CommandPreconditionData } from '../structures/CommandPrecondition.js';
import { AnyCommandExecuteData } from '../../types/structures.js';
import { CooldownData } from '../structures/Cooldown.js';
import { CommandType } from '../../types/constants.js';

export class CooldownPrecondition extends CommandPrecondition {
    public static id: string = 'org.reciple.js.cooldowns';
    public static data: CommandPreconditionData = {
        id: CooldownPrecondition.id,
        disabled: false,
        contextMenuCommandExecute: data => CooldownPrecondition._execute(data),
        slashCommandExecute: data => CooldownPrecondition._execute(data),
        messageCommandExecute: data => CooldownPrecondition._execute(data),
    };

    constructor() {
        super(CooldownPrecondition.data);
    }

    private static _execute(data: AnyCommandExecuteData): boolean {
        const duration = data.builder.cooldown;
        if (!duration) return true;

        switch (data.builder.command_type) {
            case CommandType.ContextMenuCommand:
                if (data.client.config.commands?.contextMenuCommand?.enableCooldown === false) return true;
                break;
            case CommandType.MessageCommand:
                if (data.client.config.commands?.messageCommand?.enableCooldown === false) return true;
                break;
            case CommandType.SlashCommand:
                if (data.client.config.commands?.slashCommand?.enableCooldown === false) return true;
                break;
        }

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
}
