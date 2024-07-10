import { CooldownManager } from '../managers/CooldownManager.js';
import { CommandType } from '../../types/constants.js';
import { type JSONEncodable, type TextBasedChannel } from 'discord.js';

export interface CooldownData {
    /**
     * The user id of the user that the cooldown is for.
     */
    userId: string;
    /**
     * The date that the cooldown ends at.
     */
    endsAt: Date;
    /**
     * The channel id of the channel that the cooldown is for.
     */
    channelId?: string;
    /**
     * The guild id of the guild that the cooldown is for.
     */
    guildId?: string;
    /**
     * The name of the command that the cooldown is for.
     */
    commandName?: string;
    /**
     * The type of the command that the cooldown is for.
     */
    commandType?: CommandType;
}

export class Cooldown implements CooldownData {
    readonly id: string;
    readonly userId: string;
    readonly endsAt: Date;
    readonly channelId?: string;
    readonly guildId?: string;
    readonly commandName?: string;
    readonly commandType?: CommandType;
    readonly createdAt: Date = new Date();

    get remainingMs() {
        const remaining = this.endsAt.getTime() - Date.now();
        return remaining >= 0 ? remaining : 0;
    }

    get user() {
        return this.manager.client.users.cache.get(this.userId);
    }

    get channel() {
        return this.channelId ? this.manager.client.channels.cache.get(this.channelId) as TextBasedChannel|undefined : null;
    }

    get guild() {
        if (this.guildId) return this.manager.client.guilds.cache.get(this.guildId);
        return this.channel && !this.channel.isDMBased() ? this.channel.guild : undefined;
    }

    constructor(data: CooldownData, readonly manager: CooldownManager) {
        this.id = CooldownManager.generateId();
        this.userId = data.userId;
        this.endsAt = data.endsAt;
        this.channelId = data.channelId;
        this.guildId = data.guildId;
        this.commandName = data.commandName;
        this.commandType = data.commandType;
    }

    /**
     * Check if the cooldown has ended.
     */
    public isEnded(): boolean {
        return this.endsAt.getTime() <= Date.now();
    }

    public toJSON(): CooldownData {
        return {
            userId: this.userId,
            endsAt: this.endsAt,
            channelId: this.channelId,
            guildId: this.guildId,
            commandName: this.commandName,
            commandType: this.commandType
        };
    }
}

export type CooldownResolvable = CooldownData|JSONEncodable<CooldownData>;
