import { CommandType } from '../../types/constants';
import { CooldownManager } from '../managers/CooldownManager';

export interface CooldownData {
    userId: string;
    endsAt: Date;
    channelId?: string;
    commandName?: string;
    commandType?: CommandType;
}

export class Cooldown implements CooldownData {
    readonly id: string;
    readonly userId: string;
    readonly endsAt: Date;
    readonly channelId?: string;
    readonly commandName?: string;
    readonly commandType?: CommandType;
    readonly createdAt: Date = new Date();

    get remainingMs() {
        const remaining = this.endsAt.getTime() - Date.now();
        return remaining >= 0 ? remaining : 0;
    }

    constructor(data: CooldownData, readonly manager: CooldownManager) {
        this.id = CooldownManager.generateId();
        this.userId = data.userId;
        this.endsAt = data.endsAt;
        this.channelId = data.channelId;
        this.commandName = data.commandName;
        this.commandType = data.commandType;
    }

    public isEnded(): boolean {
        return this.endsAt.getTime() <= Date.now();
    }

    public toJSON(): CooldownData {
        return {
            userId: this.userId,
            endsAt: this.endsAt,
            channelId: this.channelId,
            commandName: this.commandName,
            commandType: this.commandType
        };
    }
}
